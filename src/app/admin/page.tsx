"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Edit, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/components/auth-provider"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import type { Product } from "@/lib/types"

export default function AdminDashboard() {
  const router = useRouter()
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: "",
    description: "",
    price: 0,
    originalPrice: 0,
    category: "",
    image: "/placeholder.svg?height=300&width=300",
    rating: 0,
    onSale: false,
    stock: 0,
    active: true,
  })

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.category || !newProduct.price || newProduct.stock === undefined) {
      console.error("Missing required product fields")
      return
    }

    try {
      const response = await fetch(process.env.NEXT_PUBLIC_API_BASE_URL + "/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newProduct,
          price: Number(newProduct.price) || 0,
          originalPrice: Number(newProduct.originalPrice) || Number(newProduct.price) || 0,
          rating: Number(newProduct.rating) || 0,
          stock: Number(newProduct.stock) || 0,
          onSale: Boolean(newProduct.onSale),
          active: Boolean(newProduct.active),
        }),
      })

      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorData}`)
      }

      const addedProduct: Product = await response.json()

      setProducts([...products, addedProduct])
      setNewProduct({
        name: "",
        description: "",
        price: 0,
        originalPrice: 0,
        category: "",
        image: "/placeholder.svg?height=300&width=300",
        rating: 0,
        onSale: false,
        stock: 0,
        active: true,
      })
    } catch (error) {
      console.error("Failed to add product:", error)
    }
  }

  const handleUpdateProduct = async () => {
    if (!editingProduct || !editingProduct.id) return

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/products/${editingProduct.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...editingProduct,
          price: Number(editingProduct.price) || 0,
          originalPrice: Number(editingProduct.originalPrice) || Number(editingProduct.price) || 0,
          rating: Number(editingProduct.rating) || 0,
          stock: Number(editingProduct.stock) || 0,
          onSale: Boolean(editingProduct.onSale),
          active: Boolean(editingProduct.active),
        }),
      })

      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorData}`)
      }

      const updatedProduct: Product = await response.json()

      setProducts(products.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)))
      setEditingProduct(null)
    } catch (error) {
      console.error("Failed to update product:", error)
    }
  }

  const handleDeleteProduct = async (id: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/products/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        if (response.status === 204 || response.status === 200) {
        } else {
          const errorData = await response.text()
          throw new Error(`HTTP error! status: ${response.status}, body: ${errorData}`)
        }
      }

      setProducts(products.filter((p) => p.id !== id))
      if (editingProduct?.id === id) {
        setEditingProduct(null)
      }
    } catch (error) {
      console.error("Failed to delete product:", error)
    }
  }

  return (
    <div className="container px-4 py-8 md:py-12">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <Tabs defaultValue="products">
        <TabsList className="mb-8">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <div className="grid gap-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Products</h2>
              <Button onClick={() => setEditingProduct(null)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </div>

            {editingProduct === null ? (
              <Card>
                <CardHeader>
                  <CardTitle>Add New Product</CardTitle>
                  <CardDescription>Fill in the details to add a new product</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Product Name</Label>
                        <Input
                          id="name"
                          value={newProduct.name}
                          onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Input
                          id="category"
                          value={newProduct.category}
                          onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="price">Price</Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          value={newProduct.price}
                          onChange={(e) => setNewProduct({ ...newProduct, price: Number.parseFloat(e.target.value) || 0 })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="originalPrice">Original Price (Optional)</Label>
                        <Input
                          id="originalPrice"
                          type="number"
                          step="0.01"
                          value={newProduct.originalPrice}
                          onChange={(e) =>
                            setNewProduct({ ...newProduct, originalPrice: Number.parseFloat(e.target.value) || 0 })
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="stock">Stock</Label>
                        <Input
                          id="stock"
                          type="number"
                          step="1"
                          value={newProduct.stock}
                          onChange={(e) =>
                            setNewProduct({ ...newProduct, stock: Number.parseInt(e.target.value, 10) || 0 })
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="image">Image URL</Label>
                        <Input
                          id="image"
                          value={newProduct.image}
                          onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <textarea
                        id="description"
                        rows={3}
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={newProduct.description}
                        onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                      />
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="onSale"
                          checked={newProduct.onSale}
                          onCheckedChange={(checked) => setNewProduct({ ...newProduct, onSale: checked })}
                        />
                        <Label htmlFor="onSale">On Sale</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="active"
                          checked={newProduct.active}
                          onCheckedChange={(checked) => setNewProduct({ ...newProduct, active: checked })}
                        />
                        <Label htmlFor="active">Active</Label>
                      </div>
                    </div>

                    <Button
                      onClick={handleAddProduct}
                      disabled={!newProduct.name || !newProduct.category || !newProduct.price || newProduct.stock === undefined}
                    >
                      Add Product
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Edit Product</CardTitle>
                  <CardDescription>Update the product details</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-name">Product Name</Label>
                        <Input
                          id="edit-name"
                          value={editingProduct.name}
                          onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="edit-category">Category</Label>
                        <Input
                          id="edit-category"
                          value={editingProduct.category}
                          onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="edit-price">Price</Label>
                        <Input
                          id="edit-price"
                          type="number"
                          step="0.01"
                          value={editingProduct.price}
                          onChange={(e) =>
                            setEditingProduct({ ...editingProduct, price: Number.parseFloat(e.target.value) || 0 })
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="edit-originalPrice">Original Price</Label>
                        <Input
                          id="edit-originalPrice"
                          type="number"
                          step="0.01"
                          value={editingProduct.originalPrice}
                          onChange={(e) =>
                            setEditingProduct({ ...editingProduct, originalPrice: Number.parseFloat(e.target.value) || 0 })
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="edit-stock">Stock</Label>
                        <Input
                          id="edit-stock"
                          type="number"
                          step="1"
                          value={editingProduct.stock}
                          onChange={(e) =>
                            setEditingProduct({ ...editingProduct, stock: Number.parseInt(e.target.value, 10) || 0 })
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="edit-image">Image URL</Label>
                        <Input
                          id="edit-image"
                          value={editingProduct.image}
                          onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-description">Description</Label>
                      <textarea
                        id="edit-description"
                        rows={3}
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={editingProduct.description}
                        onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                      />
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="edit-onSale"
                          checked={editingProduct.onSale}
                          onCheckedChange={(checked) => setEditingProduct({ ...editingProduct, onSale: checked })}
                        />
                        <Label htmlFor="edit-onSale">On Sale</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="edit-active"
                          checked={editingProduct.active}
                          onCheckedChange={(checked) => setEditingProduct({ ...editingProduct, active: checked })}
                        />
                        <Label htmlFor="edit-active">Active</Label>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={handleUpdateProduct}>Update Product</Button>
                      <Button variant="outline" onClick={() => setEditingProduct(null)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="border rounded-lg overflow-hidden">
              <div className="grid grid-cols-6 gap-4 p-4 bg-gray-50 dark:bg-gray-800 font-medium">
                <div>Image</div>
                <div className="col-span-2">Name</div>
                <div>Price</div>
                <div>Stock</div>
                <div>Actions</div>
              </div>

              {products.map((product) => (
                <div key={product.id} className="grid grid-cols-6 gap-4 p-4 items-center border-t">
                  <div>
                    <img
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  </div>
                  <div className="col-span-2">
                    <h3 className="font-medium">{product.name}</h3>
                    <p className="text-sm text-gray-500 capitalize">{product.category}</p>
                    <p className={`text-xs ${product.active ? "text-green-600" : "text-red-600"}`}>
                      {product.active ? "Active" : "Inactive"}
                    </p>
                  </div>
                  <div>
                    {product.onSale && product.originalPrice && product.originalPrice > product.price ? (
                      <>
                        <span className="text-red-600">${product.price.toFixed(2)}</span>
                        <span className="line-through text-gray-500 ml-1">${product.originalPrice.toFixed(2)}</span>
                      </>
                    ) : (
                      `$${product.price.toFixed(2)}`
                    )}
                  </div>
                  <div>{product.stock}</div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => setEditingProduct(product)}>
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteProduct(product.id)}>
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Orders</CardTitle>
              <CardDescription>Manage customer orders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-gray-500">No orders to display</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers">
          <Card>
            <CardHeader>
              <CardTitle>Customers</CardTitle>
              <CardDescription>Manage customer accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-gray-500">No customers to display</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

