"use client";

import { Button } from "@/components/ui/button";
import { ShoppingCart, Menu, Search, User } from "lucide-react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet";
import { useState, useMemo } from "react";
import { Loader2 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCartStore } from "@/stores/cart-store";
import { CartItem } from "@/components/cart/cart-item";
import { ModeToggle } from "@/components/mode-toggle";
import { CategoryNav } from "@/components/navigation/category-nav";
import { createCartProductsQueryOptions } from "@/lib/tanstack/options/cart";
import { useNavigate } from "@tanstack/react-router";
import { calculateCartSubtotal } from "@/utils/cart/cart-calculation";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { createGetMeQueryOptions } from "@/lib/tanstack/options/user";
import { useAuthStore } from "@/stores/auth-store";
import { Link } from "@tanstack/react-router";

function UserSection() {
  const { data: user, refetch } = useQuery(createGetMeQueryOptions());
  const queryClient = useQueryClient();
  const logout = useAuthStore((state) => state.clear);

  // Not logged in
  if (!user) {
    return (
      <Button variant="ghost" asChild>
        <Link to="/login" className="text-sm">
          Login
        </Link>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="p-0">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt="avatar"
              className="h-8 w-8 rounded-full border object-cover"
            />
          ) : (
            <User className="h-6 w-6" />
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-48" align="end">
        <DropdownMenuLabel className="flex flex-col">
          <span>{user.fullName}</span>
          <span className="text-muted-foreground text-xs">{user.email}</span>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link to="/profile">My Profile</Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link to="/my-order">My Orders</Link>
        </DropdownMenuItem>

        {/* Admin Navigation */}
        {user.roleName === "ADMIN" && (
          <DropdownMenuItem asChild>
            <Link to="/admin">Admin Dashboard</Link>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="text-destructive"
          onClick={() => {
            logout();
            queryClient.clear();
            refetch();
          }}
        >
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Navigation() {
  const items = useCartStore((state) => state.items);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const productIds = useMemo(() => items.map((item) => item.productId), [items]);
  const totalItems = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);

  const { data: cartItems = [], isLoading } = useQuery(
    createCartProductsQueryOptions({
      ids: productIds,
      enabled: isOpen && productIds.length > 0
    })
  );

  const subtotal = calculateCartSubtotal(cartItems, items);

  return (
    <header className="bg-background border-border/40 fixed top-0 z-50 h-30 w-full border-b backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top promotional bar */}
        <div className="text-muted-foreground border-border/30 hidden items-center justify-center border-b px-4 py-2 text-sm lg:flex">
          <span className="font-light">
            Free shipping on orders over $50 • Premium Member Exclusive Benefits
          </span>
        </div>

        {/* Main header content */}
        <div className="flex items-center justify-between py-5">
          {/* Logo - Enhanced with serif styling */}
          <a href="/" className="group flex flex-shrink-0 items-center gap-1">
            <div className="text-foreground group-hover:text-primary font-serif text-3xl font-bold tracking-tight transition-colors">
              Les Collections
            </div>
            <div className="text-muted-foreground mt-1 hidden text-xs font-light tracking-widest sm:block">
              Média
            </div>
          </a>

          {/* Center Navigation - Hidden on Mobile */}
          <CategoryNav orientation="horizontal" />

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Search Bar - Responsive */}
            {/* <div className="hidden max-w-xs flex-1 items-center md:flex">
                          <div className="group relative w-full">
                            <input
                              type="text"
                              placeholder="Search..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="bg-muted/50 text-foreground placeholder-muted-foreground focus:ring-primary/50 border-border/40 focus:border-primary/50 group-hover:bg-muted/70 w-full rounded-lg border px-4 py-2.5 text-sm transition-all focus:ring-2 focus:outline-none"
                            />
                            <button className="text-muted-foreground group-hover:text-foreground hover:text-primary absolute top-1/2 right-3 -translate-y-1/2 p-1 transition-colors">
                              <Search className="h-4 w-4" />
                            </button>
                          </div>
                        </div> */}
            {/* <SearchBar /> */}

            {/* Mobile Menu Button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <SheetHeader className="mb-6">
                  <SheetTitle className="font-serif text-2xl">Menu</SheetTitle>
                </SheetHeader>
                <div className="px-3">
                  <CategoryNav orientation="vertical" />
                </div>
              </SheetContent>
            </Sheet>

            <Button variant="ghost" size="icon" className="md:hidden">
              <Search className="h-5 w-5" />
            </Button>

            <UserSection />

            <ModeToggle />

            {/* Cart Button */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-muted/70 relative transition-colors"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {totalItems > 0 && (
                    <span className="bg-primary text-primary-foreground absolute top-0 right-0 inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold">
                      {totalItems}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="flex flex-col p-6 sm:max-w-md">
                <SheetHeader className="border-border/40 flex flex-row items-center gap-3 border-b pb-4">
                  <ShoppingCart className="text-primary h-5 w-5" />
                  <SheetTitle className="font-serif text-xl">Your Cart</SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto py-4">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
                    </div>
                  ) : cartItems.length === 0 ? (
                    <div className="space-y-2 py-12 text-center">
                      <ShoppingCart className="text-muted-foreground mx-auto h-12 w-12 opacity-50" />
                      <p className="text-muted-foreground font-light">Your cart is empty</p>
                      <p className="text-muted-foreground text-xs">Add items to get started</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {cartItems.map((item) => (
                        <CartItem key={item.id} product={item} />
                      ))}
                    </div>
                  )}
                </div>

                {cartItems.length > 0 && (
                  <div className="border-border/40 space-y-4 border-t pt-6">
                    <div className="flex items-center justify-between">
                      <span className="text-foreground font-medium">Subtotal:</span>
                      <span className="text-primary font-serif text-lg font-bold">
                        ${subtotal.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-xs">Shipping calculated at checkout</p>
                    <Button
                      onClick={() => {
                        navigate({ to: "/checkout" });
                      }}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground w-full py-6 font-medium"
                    >
                      Proceed to Checkout
                    </Button>
                    <SheetClose asChild>
                      <Button variant="outline" className="w-full bg-transparent">
                        Continue Shopping
                      </Button>
                    </SheetClose>
                  </div>
                )}
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
