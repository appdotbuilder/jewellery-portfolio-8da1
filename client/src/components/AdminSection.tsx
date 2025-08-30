import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, Edit, Trash2, Image, AlertCircle, 
  Star, Mail, Calendar
} from 'lucide-react';
import { trpc } from '@/utils/trpc';
import type { 
  JewelleryItem, 
  CreateJewelleryItemInput,
  ContactForm,
  JewelleryCategory 
} from '../../../server/src/schema';

export function AdminSection() {
  const [items, setItems] = useState<JewelleryItem[]>([]);
  const [contacts, setContacts] = useState<ContactForm[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingItem, setEditingItem] = useState<JewelleryItem | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState<CreateJewelleryItemInput>({
    title: '',
    description: '',
    materials: '',
    size: '',
    category: 'ring',
    image_url: null,
    is_featured: false
  });

  const [imageUpload, setImageUpload] = useState<{
    file: File | null;
    preview: string | null;
    uploading: boolean;
  }>({
    file: null,
    preview: null,
    uploading: false
  });

  const categories: { value: JewelleryCategory; label: string }[] = [
    { value: 'ring', label: 'Ring' },
    { value: 'brooch', label: 'Brooch' },
    { value: 'earring', label: 'Earring' },
    { value: 'pendant', label: 'Pendant' },
    { value: 'cuff_link', label: 'Cuff Link' }
  ];

  const loadItems = useCallback(async () => {
    try {
      const result = await trpc.getJewelleryItems.query();
      setItems(result);
    } catch (error) {
      console.error('Failed to load items:', error);
    }
  }, []);

  const loadContacts = useCallback(async () => {
    try {
      const result = await trpc.getContactForms.query();
      setContacts(result);
    } catch (error) {
      console.error('Failed to load contacts:', error);
    }
  }, []);

  useEffect(() => {
    loadItems();
    loadContacts();
  }, [loadItems, loadContacts]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageUpload({
        file,
        preview: URL.createObjectURL(file),
        uploading: false
      });
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageUpload.file) return null;

    setImageUpload(prev => ({ ...prev, uploading: true }));
    
    try {
      const fileData = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
        reader.readAsDataURL(imageUpload.file!);
      });

      const result = await trpc.uploadImage.mutate({
        filename: imageUpload.file.name,
        content_type: imageUpload.file.type,
        file_data: fileData
      });

      setImageUpload(prev => ({ ...prev, uploading: false }));
      return result.url;
    } catch (error) {
      console.error('Failed to upload image:', error);
      setImageUpload(prev => ({ ...prev, uploading: false }));
      throw error;
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      materials: '',
      size: '',
      category: 'ring',
      image_url: null,
      is_featured: false
    });
    setImageUpload({ file: null, preview: null, uploading: false });
    setEditingItem(null);
    setSubmitStatus('idle');
    setErrorMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSubmitStatus('idle');

    try {
      let imageUrl = formData.image_url;
      
      if (imageUpload.file) {
        imageUrl = await uploadImage();
      }

      const dataToSubmit = { ...formData, image_url: imageUrl };

      if (editingItem) {
        const updatedItem = await trpc.updateJewelleryItem.mutate({
          id: editingItem.id,
          ...dataToSubmit
        });
        setItems((prev: JewelleryItem[]) => 
          prev.map((item: JewelleryItem) => item.id === editingItem.id ? updatedItem : item)
        );
      } else {
        const newItem = await trpc.createJewelleryItem.mutate(dataToSubmit);
        setItems((prev: JewelleryItem[]) => [newItem, ...prev]);
      }

      setSubmitStatus('success');
      setShowCreateDialog(false);
      resetForm();
    } catch (error) {
      console.error('Failed to save item:', error);
      setSubmitStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to save item');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: JewelleryItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description,
      materials: item.materials,
      size: item.size,
      category: item.category,
      image_url: item.image_url,
      is_featured: item.is_featured
    });
    setImageUpload({ file: null, preview: null, uploading: false });
    setShowCreateDialog(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
      return;
    }

    try {
      await trpc.deleteJewelleryItem.mutate({ id });
      setItems((prev: JewelleryItem[]) => prev.filter((item: JewelleryItem) => item.id !== id));
    } catch (error) {
      console.error('Failed to delete item:', error);
      alert('Failed to delete item. Please try again.');
    }
  };

  const ItemForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      {submitStatus === 'error' && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {errorMessage}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFormData((prev: CreateJewelleryItemInput) => ({ ...prev, title: e.target.value }))
            }
            placeholder="Enter item title"
            required
          />
        </div>

        <div>
          <Label htmlFor="category">Category *</Label>
          <Select
            value={formData.category}
            onValueChange={(value: JewelleryCategory) =>
              setFormData((prev: CreateJewelleryItemInput) => ({ ...prev, category: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setFormData((prev: CreateJewelleryItemInput) => ({ ...prev, description: e.target.value }))
          }
          placeholder="Describe the item in detail"
          className="min-h-[100px]"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="materials">Materials *</Label>
          <Input
            id="materials"
            value={formData.materials}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFormData((prev: CreateJewelleryItemInput) => ({ ...prev, materials: e.target.value }))
            }
            placeholder="e.g., Sterling silver, rose gold"
            required
          />
        </div>

        <div>
          <Label htmlFor="size">Size *</Label>
          <Input
            id="size"
            value={formData.size}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFormData((prev: CreateJewelleryItemInput) => ({ ...prev, size: e.target.value }))
            }
            placeholder="e.g., Size 7, 2cm diameter"
            required
          />
        </div>
      </div>

      <div>
        <Label>Image Upload</Label>
        <div className="mt-2 space-y-3">
          <div className="flex items-center space-x-2">
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:bg-amber-50 file:text-amber-700"
            />
          </div>
          
          {(imageUpload.preview || formData.image_url) && (
            <div className="relative w-32 h-32">
              <img
                src={imageUpload.preview || formData.image_url || ''}
                alt="Preview"
                className="w-full h-full object-cover rounded-md border"
              />
              {imageUpload.uploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-md">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="featured"
          checked={formData.is_featured}
          onCheckedChange={(checked: boolean) =>
            setFormData((prev: CreateJewelleryItemInput) => ({ ...prev, is_featured: checked }))
          }
        />
        <Label htmlFor="featured">Featured item</Label>
      </div>

      <div className="flex gap-2 pt-4">
        <Button
          type="submit"
          disabled={loading || imageUpload.uploading}
          className="bg-amber-600 hover:bg-amber-700"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              {editingItem ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            <>
              {editingItem ? <Edit className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              {editingItem ? 'Update Item' : 'Create Item'}
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setShowCreateDialog(false);
            resetForm();
          }}
        >
          Cancel
        </Button>
      </div>
    </form>
  );

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-serif font-bold text-stone-800">
          Admin Dashboard
        </h1>
        <p className="text-lg text-stone-600 max-w-2xl mx-auto">
          Manage your jewellery items, view contact forms, and control your portfolio.
        </p>
      </div>

      <Tabs defaultValue="items" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="items" className="flex items-center gap-2">
            <Image className="w-4 h-4" />
            Jewellery Items ({items.length})
          </TabsTrigger>
          <TabsTrigger value="contacts" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Contact Forms ({contacts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-semibold text-stone-800">Jewellery Items</h2>
              <p className="text-stone-600">Manage your portfolio items</p>
            </div>
            
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    resetForm();
                    setShowCreateDialog(true);
                  }}
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Item
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingItem ? 'Edit Item' : 'Add New Item'}
                  </DialogTitle>
                </DialogHeader>
                <ItemForm />
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item: JewelleryItem) => (
              <Card key={item.id} className="group bg-white/80 backdrop-blur-sm border-stone-200">
                <CardHeader className="pb-2">
                  <div className="relative">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-40 object-cover rounded-md"
                      />
                    ) : (
                      <div className="w-full h-40 bg-stone-200 rounded-md flex items-center justify-center">
                        <Image className="w-8 h-8 text-stone-400" />
                      </div>
                    )}
                    {item.is_featured && (
                      <Badge className="absolute top-2 left-2 bg-amber-500">
                        <Star className="w-3 h-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg line-clamp-1">{item.title}</CardTitle>
                    <Badge variant="outline" className="text-xs">
                      {item.category.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <p className="text-stone-600 text-sm mb-3 line-clamp-2">
                    {item.description}
                  </p>
                  
                  <div className="text-xs text-stone-500 space-y-1 mb-4">
                    <div><strong>Materials:</strong> {item.materials}</div>
                    <div><strong>Size:</strong> {item.size}</div>
                    <div><strong>Created:</strong> {item.created_at.toLocaleDateString()}</div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(item)}
                      className="flex-1"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {items.length === 0 && (
              <div className="col-span-full text-center py-12">
                <Image className="w-16 h-16 text-stone-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-stone-800 mb-2">
                  No items yet
                </h3>
                <p className="text-stone-600 mb-4">
                  Start building your portfolio by adding your first jewellery item.
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="contacts" className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-stone-800">Contact Forms</h2>
            <p className="text-stone-600">Messages from visitors to your website</p>
          </div>

          <div className="space-y-4">
            {contacts.map((contact: ContactForm) => (
              <Card key={contact.id} className="bg-white/80 backdrop-blur-sm border-stone-200">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{contact.name}</CardTitle>
                      <p className="text-stone-600">{contact.email}</p>
                    </div>
                    <div className="text-right text-sm text-stone-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {contact.created_at.toLocaleDateString()}
                      </div>
                      <div>{contact.created_at.toLocaleTimeString()}</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-stone-50 p-4 rounded-md">
                    <p className="text-stone-700 whitespace-pre-wrap">{contact.message}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {contacts.length === 0 && (
              <div className="text-center py-12">
                <Mail className="w-16 h-16 text-stone-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-stone-800 mb-2">
                  No messages yet
                </h3>
                <p className="text-stone-600">
                  Contact form submissions will appear here.
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}