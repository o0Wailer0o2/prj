"use client";

import type React from "react";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
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
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { updateOrder, getOrderById } from "@/lib/axios/order";
import { toast } from "sonner";
import type { OrderDTO, OrderStatus } from "@/lib/types/order";
import { Loader2 } from "lucide-react";

interface OrderFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId?: number;
}

const orderStatuses: { value: OrderStatus; label: string }[] = [
  { value: "PENDING", label: "Pending" },
  { value: "PROCESSING", label: "Processing" },
  { value: "RETURNED", label: "Returned" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "COMPLETED", label: "Completed" }
];

export function OrderFormDialog({ open, onOpenChange, orderId }: OrderFormDialogProps) {
  const isEditMode = !!orderId;
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<Partial<OrderDTO>>({
    userFullName: "",
    userEmail: "",
    userPhoneNumber: "",
    shippingStreet: "",
    shippingCity: "",
    shippingDistrict: "",
    shippingCountry: "",
    shippingZip: "",
    shippingNumber: "",
    tax: 0,
    deliveryFee: 0,
    discount: 0,
    totalPrice: 0,
    status: "PENDING",
    orderNotes: ""
  });

  // Fetch order data if editing
  const { data: orderData } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => getOrderById(orderId!),
    enabled: isEditMode && open
  });

  useEffect(() => {
    if (orderData && isEditMode) {
      setFormData(orderData);
    } else if (!isEditMode) {
      // Reset form for create mode
      setFormData({
        userFullName: "",
        userEmail: "",
        userPhoneNumber: "",
        shippingStreet: "",
        shippingCity: "",
        shippingDistrict: "",
        shippingCountry: "",
        shippingZip: "",
        shippingNumber: "",
        tax: 0,
        deliveryFee: 0,
        discount: 0,
        totalPrice: 0,
        status: "PENDING",
        orderNotes: ""
      });
    }
  }, [orderData, isEditMode, open]);

  const updateMutation = useMutation({
    mutationFn: updateOrder,
    onSuccess: () => {
      toast.success("Order updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(`Failed to update order: ${error.message}`);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.userFullName || !formData.userEmail) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (isEditMode && orderId) {
      updateMutation.mutate({ ...formData, id: orderId } as OrderDTO);
    } else {
      toast.error("Create order functionality should be implemented separately with order items");
    }
  };

  const isLoading = updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Order" : "View Order Details"}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update order information and status"
              : "Order details and shipping information"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Order Code (Read-only) */}
          {isEditMode && formData.code && (
            <div className="space-y-2">
              <Label>Order Code</Label>
              <Input value={formData.code} disabled />
            </div>
          )}

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">
              Order Status <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value as OrderStatus })}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {orderStatuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Customer Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Customer Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="userFullName">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="userFullName"
                  value={formData.userFullName}
                  onChange={(e) => setFormData({ ...formData, userFullName: e.target.value })}
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="userEmail">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="userEmail"
                  type="email"
                  value={formData.userEmail}
                  onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
                  placeholder="Enter email"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="userPhoneNumber">Phone Number</Label>
                <Input
                  id="userPhoneNumber"
                  value={formData.userPhoneNumber}
                  onChange={(e) => setFormData({ ...formData, userPhoneNumber: e.target.value })}
                  placeholder="Enter phone number"
                />
              </div>
            </div>
          </div>

          {/* Shipping Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Shipping Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="shippingStreet">Street Address</Label>
                <Input
                  id="shippingStreet"
                  value={formData.shippingStreet}
                  onChange={(e) => setFormData({ ...formData, shippingStreet: e.target.value })}
                  placeholder="Enter street address"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shippingCity">City</Label>
                <Input
                  id="shippingCity"
                  value={formData.shippingCity}
                  onChange={(e) => setFormData({ ...formData, shippingCity: e.target.value })}
                  placeholder="Enter city"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shippingDistrict">District</Label>
                <Input
                  id="shippingDistrict"
                  value={formData.shippingDistrict}
                  onChange={(e) => setFormData({ ...formData, shippingDistrict: e.target.value })}
                  placeholder="Enter district"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shippingCountry">Country</Label>
                <Input
                  id="shippingCountry"
                  value={formData.shippingCountry}
                  onChange={(e) => setFormData({ ...formData, shippingCountry: e.target.value })}
                  placeholder="Enter country"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shippingZip">Zip Code</Label>
                <Input
                  id="shippingZip"
                  value={formData.shippingZip}
                  onChange={(e) => setFormData({ ...formData, shippingZip: e.target.value })}
                  placeholder="Enter zip code"
                />
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="shippingNumber">Tracking Number</Label>
                <Input
                  id="shippingNumber"
                  value={formData.shippingNumber || ""}
                  onChange={(e) => setFormData({ ...formData, shippingNumber: e.target.value })}
                  placeholder="Enter tracking number"
                />
              </div>
            </div>
          </div>

          {/* Pricing Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Pricing Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tax">Tax</Label>
                <Input
                  id="tax"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.tax}
                  onChange={(e) =>
                    setFormData({ ...formData, tax: Number.parseFloat(e.target.value) })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deliveryFee">Delivery Fee</Label>
                <Input
                  id="deliveryFee"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.deliveryFee}
                  onChange={(e) =>
                    setFormData({ ...formData, deliveryFee: Number.parseFloat(e.target.value) })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="discount">Discount (%)</Label>
                <Input
                  id="discount"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.discount}
                  onChange={(e) =>
                    setFormData({ ...formData, discount: Number.parseFloat(e.target.value) })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="totalPrice">Total Price</Label>
                <Input
                  id="totalPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.totalPrice}
                  onChange={(e) =>
                    setFormData({ ...formData, totalPrice: Number.parseFloat(e.target.value) })
                  }
                />
              </div>
            </div>
          </div>

          {/* Order Notes */}
          <div className="space-y-2">
            <Label htmlFor="orderNotes">Order Notes</Label>
            <Textarea
              id="orderNotes"
              value={formData.orderNotes || ""}
              onChange={(e) => setFormData({ ...formData, orderNotes: e.target.value })}
              placeholder="Add any notes about this order..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            {isEditMode && (
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Order
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
