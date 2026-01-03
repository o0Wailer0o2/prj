/* eslint-disable no-case-declarations */
"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createProductMutationOptions,
  updateProductMutationOptions
} from "@/lib/tanstack/options/product";
import { uploadFile } from "@/lib/axios/upload";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import type {
  ProductDTO,
  ProductType,
  BookDetails,
  CDDetails,
  DVDDetails,
  NewspaperDetails
} from "@/lib/types/product";
import { toast } from "sonner";
import { Loader2, Upload, X } from "lucide-react";
import {
  createBook,
  updateBook,
  getBook,
  createCD,
  updateCD,
  getCD,
  createDVD,
  updateDVD,
  getDVD,
  createNewspaper,
  updateNewspaper,
  getNewspaper
} from "@/lib/axios/product-type";

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: ProductDTO;
  mode: "create" | "edit";
}

export function ProductFormDialog({ open, onOpenChange, product, mode }: ProductFormDialogProps) {
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<Partial<ProductDTO>>(
    product ?? {
      title: "",
      description: "",
      type: "BOOK",
      currentPrice: 0,
      originalValue: 0,
      stock: 0,
      barcode: "",
      height: 0,
      width: 0,
      length: 0,
      weight: 0,
      status: 1,
      imageUrl: ""
    }
  );

  const [bookDetails, setBookDetails] = useState<Partial<BookDetails>>({
    authors: "",
    coverType: "",
    publisher: "",
    publicationDate: "",
    pages: 0,
    language: "",
    genre: ""
  });

  const [cdDetails, setCDDetails] = useState<Partial<CDDetails>>({
    artists: "",
    recordLabel: "",
    genre: "",
    releaseDate: "",
    lengthSeconds: 0
  });

  const [dvdDetails, setDVDDetails] = useState<Partial<DVDDetails>>({
    discType: "",
    director: "",
    runtimeMinutes: 0,
    studio: "",
    language: "",
    subtitles: "",
    releaseDate: "",
    genre: ""
  });

  const [newspaperDetails, setNewspaperDetails] = useState<Partial<NewspaperDetails>>({
    editorInChief: "",
    publisher: "",
    publicationDate: "",
    issueNumber: 0,
    frequency: "",
    issn: "",
    language: "",
    sections: ""
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(product?.imageUrl || "");
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  useEffect(() => {
    if (mode === "edit" && product?.id && open) {
      const fetchTypeDetails = async () => {
        try {
          switch (product.type) {
            case "BOOK":
              const book = await getBook(product.id);
              setBookDetails(book);
              break;
            case "CD":
              const cd = await getCD(product.id);
              setCDDetails(cd);
              break;
            case "DVD":
              const dvd = await getDVD(product.id);
              setDVDDetails(dvd);
              break;
            case "NEWSPAPER":
              const newspaper = await getNewspaper(product.id);
              setNewspaperDetails(newspaper);
              break;
          }
        } catch (error) {
          console.error("Failed to fetch type details:", error);
        }
      };
      fetchTypeDetails();
    }
  }, [mode, product?.id, product?.type, open]);

  const createMutation = useMutation({
    ...createProductMutationOptions(),
    onSuccess: async (createdProduct) => {
      try {
        switch (createdProduct.type) {
          case "BOOK":
            await createBook({
              ...(bookDetails as BookDetails),
              productId: createdProduct.id
            } as BookDetails);
            break;
          case "CD":
            await createCD({
              ...(cdDetails as CDDetails),
              productId: createdProduct.id
            } as CDDetails);
            break;
          case "DVD":
            await createDVD({
              ...(dvdDetails as DVDDetails),
              productId: createdProduct.id
            } as DVDDetails);
            break;
          case "NEWSPAPER":
            await createNewspaper({
              ...(newspaperDetails as NewspaperDetails),
              productId: createdProduct.id
            } as NewspaperDetails);
            break;
        }
        toast.success("Product created successfully!");
        queryClient.invalidateQueries({ queryKey: ["products"] });
        onOpenChange(false);
        resetForm();
      } catch (error) {
        toast.error("Product created but failed to save type details");
      }
    },
    onError: (error) => {
      toast.error(`Failed to create product: ${error.message}`);
    }
  });

  const updateMutation = useMutation({
    ...updateProductMutationOptions(),
    onSuccess: async (updatedProduct) => {
      try {
        switch (updatedProduct.type) {
          case "BOOK":
            await updateBook({ ...bookDetails, productId: updatedProduct.id } as BookDetails);
            break;
          case "CD":
            await updateCD({ ...cdDetails, productId: updatedProduct.id } as CDDetails);
            break;
          case "DVD":
            await updateDVD({ ...dvdDetails, productId: updatedProduct.id } as DVDDetails);
            break;
          case "NEWSPAPER":
            await updateNewspaper({
              ...newspaperDetails,
              productId: updatedProduct.id
            } as NewspaperDetails);
            break;
        }
        toast.success("Product updated successfully!");
        queryClient.invalidateQueries({ queryKey: ["products"] });
        onOpenChange(false);
        resetForm();
      } catch (error) {
        toast.error("Product updated but failed to save type details");
      }
    },
    onError: (error) => {
      toast.error(`Failed to update product: ${error.message}`);
    }
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview("");
    setFormData((prev) => ({ ...prev, imageUrl: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let imageUrl = formData.imageUrl || "";

    if (imageFile) {
      setIsUploadingImage(true);
      try {
        imageUrl = await uploadFile(imageFile);
      } catch (error) {
        toast.error("Failed to upload image");
        setIsUploadingImage(false);
        return;
      }
      setIsUploadingImage(false);
    }

    const productData = {
      ...formData,
      imageUrl
    };

    if (mode === "create") {
      createMutation.mutate(productData);
    } else {
      updateMutation.mutate(productData as ProductDTO);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      type: "BOOK",
      currentPrice: 0,
      originalValue: 0,
      stock: 0,
      barcode: "",
      height: 0,
      width: 0,
      length: 0,
      weight: 0,
      status: 1,
      imageUrl: ""
    });
    setBookDetails({
      authors: "",
      coverType: "",
      publisher: "",
      publicationDate: "",
      pages: 0,
      language: "",
      genre: ""
    });
    setCDDetails({
      artists: "",
      recordLabel: "",
      genre: "",
      releaseDate: "",
      lengthSeconds: 0
    });
    setDVDDetails({
      discType: "",
      director: "",
      runtimeMinutes: 0,
      studio: "",
      language: "",
      subtitles: "",
      releaseDate: "",
      genre: ""
    });
    setNewspaperDetails({
      editorInChief: "",
      publisher: "",
      publicationDate: "",
      issueNumber: 0,
      frequency: "",
      issn: "",
      language: "",
      sections: ""
    });
    setImageFile(null);
    setImagePreview("");
  };

  const isLoading = createMutation.isPending || updateMutation.isPending || isUploadingImage;

  const renderTypeSpecificFields = () => {
    switch (formData.type) {
      case "BOOK":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="authors">Authors *</Label>
              <Input
                id="authors"
                required
                value={bookDetails.authors}
                onChange={(e) => setBookDetails((prev) => ({ ...prev, authors: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="coverType">Cover Type</Label>
                <Input
                  id="coverType"
                  value={bookDetails.coverType}
                  onChange={(e) =>
                    setBookDetails((prev) => ({ ...prev, coverType: e.target.value }))
                  }
                  placeholder="e.g., Hardcover, Paperback"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pages">Pages</Label>
                <Input
                  id="pages"
                  type="number"
                  min="0"
                  value={bookDetails.pages}
                  onChange={(e) =>
                    setBookDetails((prev) => ({ ...prev, pages: Number.parseInt(e.target.value) }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="publisher">Publisher</Label>
                <Input
                  id="publisher"
                  value={bookDetails.publisher}
                  onChange={(e) =>
                    setBookDetails((prev) => ({ ...prev, publisher: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="publicationDate">Publication Date</Label>
                <Input
                  id="publicationDate"
                  type="datetime-local"
                  value={bookDetails.publicationDate}
                  onChange={(e) =>
                    setBookDetails((prev) => ({ ...prev, publicationDate: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Input
                  id="language"
                  value={bookDetails.language}
                  onChange={(e) =>
                    setBookDetails((prev) => ({ ...prev, language: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="genre">Genre</Label>
                <Input
                  id="genre"
                  value={bookDetails.genre}
                  onChange={(e) => setBookDetails((prev) => ({ ...prev, genre: e.target.value }))}
                />
              </div>
            </div>
          </>
        );

      case "CD":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="artists">Artists *</Label>
              <Input
                id="artists"
                required
                value={cdDetails.artists}
                onChange={(e) => setCDDetails((prev) => ({ ...prev, artists: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="recordLabel">Record Label</Label>
                <Input
                  id="recordLabel"
                  value={cdDetails.recordLabel}
                  onChange={(e) =>
                    setCDDetails((prev) => ({ ...prev, recordLabel: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="genre">Genre</Label>
                <Input
                  id="genre"
                  value={cdDetails.genre}
                  onChange={(e) => setCDDetails((prev) => ({ ...prev, genre: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="releaseDate">Release Date</Label>
                <Input
                  id="releaseDate"
                  type="datetime-local"
                  value={cdDetails.releaseDate}
                  onChange={(e) =>
                    setCDDetails((prev) => ({ ...prev, releaseDate: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lengthSeconds">Length (seconds)</Label>
                <Input
                  id="lengthSeconds"
                  type="number"
                  min="0"
                  value={cdDetails.lengthSeconds}
                  onChange={(e) =>
                    setCDDetails((prev) => ({
                      ...prev,
                      lengthSeconds: Number.parseInt(e.target.value)
                    }))
                  }
                />
              </div>
            </div>
          </>
        );

      case "DVD":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="director">Director *</Label>
              <Input
                id="director"
                required
                value={dvdDetails.director}
                onChange={(e) => setDVDDetails((prev) => ({ ...prev, director: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="discType">Disc Type</Label>
                <Input
                  id="discType"
                  value={dvdDetails.discType}
                  onChange={(e) => setDVDDetails((prev) => ({ ...prev, discType: e.target.value }))}
                  placeholder="e.g., DVD, Blu-ray"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="runtimeMinutes">Runtime (minutes)</Label>
                <Input
                  id="runtimeMinutes"
                  type="number"
                  min="0"
                  value={dvdDetails.runtimeMinutes}
                  onChange={(e) =>
                    setDVDDetails((prev) => ({
                      ...prev,
                      runtimeMinutes: Number.parseInt(e.target.value)
                    }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="studio">Studio</Label>
                <Input
                  id="studio"
                  value={dvdDetails.studio}
                  onChange={(e) => setDVDDetails((prev) => ({ ...prev, studio: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="releaseDate">Release Date</Label>
                <Input
                  id="releaseDate"
                  type="datetime-local"
                  value={dvdDetails.releaseDate}
                  onChange={(e) =>
                    setDVDDetails((prev) => ({ ...prev, releaseDate: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Input
                  id="language"
                  value={dvdDetails.language}
                  onChange={(e) => setDVDDetails((prev) => ({ ...prev, language: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subtitles">Subtitles</Label>
                <Input
                  id="subtitles"
                  value={dvdDetails.subtitles}
                  onChange={(e) =>
                    setDVDDetails((prev) => ({ ...prev, subtitles: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="genre">Genre</Label>
              <Input
                id="genre"
                value={dvdDetails.genre}
                onChange={(e) => setDVDDetails((prev) => ({ ...prev, genre: e.target.value }))}
              />
            </div>
          </>
        );

      case "NEWSPAPER":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="editorInChief">Editor in Chief *</Label>
              <Input
                id="editorInChief"
                required
                value={newspaperDetails.editorInChief}
                onChange={(e) =>
                  setNewspaperDetails((prev) => ({ ...prev, editorInChief: e.target.value }))
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="publisher">Publisher</Label>
                <Input
                  id="publisher"
                  value={newspaperDetails.publisher}
                  onChange={(e) =>
                    setNewspaperDetails((prev) => ({ ...prev, publisher: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="publicationDate">Publication Date</Label>
                <Input
                  id="publicationDate"
                  type="datetime-local"
                  value={newspaperDetails.publicationDate}
                  onChange={(e) =>
                    setNewspaperDetails((prev) => ({ ...prev, publicationDate: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="issueNumber">Issue Number</Label>
                <Input
                  id="issueNumber"
                  type="number"
                  min="0"
                  value={newspaperDetails.issueNumber}
                  onChange={(e) =>
                    setNewspaperDetails((prev) => ({
                      ...prev,
                      issueNumber: Number.parseInt(e.target.value)
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="frequency">Frequency</Label>
                <Input
                  id="frequency"
                  value={newspaperDetails.frequency}
                  onChange={(e) =>
                    setNewspaperDetails((prev) => ({ ...prev, frequency: e.target.value }))
                  }
                  placeholder="e.g., Daily, Weekly"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="issn">ISSN</Label>
                <Input
                  id="issn"
                  value={newspaperDetails.issn}
                  onChange={(e) =>
                    setNewspaperDetails((prev) => ({ ...prev, issn: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Input
                  id="language"
                  value={newspaperDetails.language}
                  onChange={(e) =>
                    setNewspaperDetails((prev) => ({ ...prev, language: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sections">Sections</Label>
              <Input
                id="sections"
                value={newspaperDetails.sections}
                onChange={(e) =>
                  setNewspaperDetails((prev) => ({ ...prev, sections: e.target.value }))
                }
                placeholder="e.g., News, Sports, Entertainment"
              />
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Create New Product" : "Edit Product"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Product Image</Label>
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview || "/placeholder.svg"}
                  alt="Preview"
                  className="h-40 w-full rounded-lg object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={handleRemoveImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <label className="border-muted-foreground/25 hover:bg-muted/50 flex h-40 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors">
                <Upload className="text-muted-foreground mb-2 h-8 w-8" />
                <span className="text-muted-foreground text-sm">Click to upload image</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
            )}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              required
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
            />
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Type *</Label>
            <Select
              value={formData.type}
              onValueChange={(value: ProductType) =>
                setFormData((prev) => ({ ...prev, type: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BOOK">Book</SelectItem>
                <SelectItem value="CD">CD</SelectItem>
                <SelectItem value="DVD">DVD</SelectItem>
                <SelectItem value="NEWSPAPER">Newspaper</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            />
          </div>

          {/* Barcode */}
          <div className="space-y-2">
            <Label htmlFor="barcode">Barcode</Label>
            <Input
              id="barcode"
              value={formData.barcode}
              onChange={(e) => setFormData((prev) => ({ ...prev, barcode: e.target.value }))}
            />
          </div>

          {/* Prices */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="originalValue">Original Price *</Label>
              <Input
                id="originalValue"
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.originalValue}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    originalValue: Number.parseFloat(e.target.value)
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentPrice">Current Price *</Label>
              <Input
                id="currentPrice"
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.currentPrice}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    currentPrice: Number.parseFloat(e.target.value)
                  }))
                }
              />
            </div>
          </div>

          {/* Stock & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stock">Stock *</Label>
              <Input
                id="stock"
                type="number"
                required
                min="0"
                value={formData.stock}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, stock: Number.parseInt(e.target.value) }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={String(formData.status)}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, status: Number.parseInt(value) }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Active</SelectItem>
                  <SelectItem value="0">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Dimensions */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="height">Height (cm)</Label>
              <Input
                id="height"
                type="number"
                min="0"
                step="0.1"
                value={formData.height}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, height: Number.parseFloat(e.target.value) }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="width">Width (cm)</Label>
              <Input
                id="width"
                type="number"
                min="0"
                step="0.1"
                value={formData.width}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, width: Number.parseFloat(e.target.value) }))
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="length">Length (cm)</Label>
              <Input
                id="length"
                type="number"
                min="0"
                step="0.1"
                value={formData.length}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, length: Number.parseFloat(e.target.value) }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                min="0"
                step="0.1"
                value={formData.weight}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, weight: Number.parseFloat(e.target.value) }))
                }
              />
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="mb-4 font-semibold">
              {formData.type === "BOOK" && "Book Details"}
              {formData.type === "CD" && "CD Details"}
              {formData.type === "DVD" && "DVD Details"}
              {formData.type === "NEWSPAPER" && "Newspaper Details"}
            </h3>
            {renderTypeSpecificFields()}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === "create" ? "Create Product" : "Update Product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
