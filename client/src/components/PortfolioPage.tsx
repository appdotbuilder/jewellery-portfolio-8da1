import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Star, Grid, List, Eye } from 'lucide-react';
import { trpc } from '@/utils/trpc';
import type { JewelleryItem, JewelleryCategoryFilter } from '../../../server/src/schema';

export function PortfolioPage() {
  const [items, setItems] = useState<JewelleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<JewelleryCategoryFilter>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedItem, setSelectedItem] = useState<JewelleryItem | null>(null);
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);

  const categories = [
    { value: 'all' as const, label: 'All Items', emoji: '✨' },
    { value: 'ring' as const, label: 'Rings', emoji: '💍' },
    { value: 'brooch' as const, label: 'Brooches', emoji: '🌸' },
    { value: 'earring' as const, label: 'Earrings', emoji: '👂' },
    { value: 'pendant' as const, label: 'Pendants', emoji: '🔗' },
    { value: 'cuff_link' as const, label: 'Cuff Links', emoji: '📎' },
  ];

  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      const result = await trpc.getJewelleryItems.query({
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        featured_only: showFeaturedOnly
      });
      setItems(result);
    } catch (error) {
      console.error('Failed to load jewellery items:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, showFeaturedOnly]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const formatCategoryLabel = (category: string) => {
    return category.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const ItemSkeleton = () => (
    <Card className="overflow-hidden">
      <Skeleton className="w-full h-64" />
      <CardContent className="p-4">
        <Skeleton className="h-4 w-3/4 mb-2" />
        <Skeleton className="h-3 w-full mb-2" />
        <Skeleton className="h-3 w-2/3" />
      </CardContent>
    </Card>
  );

  const ItemCard = ({ item }: { item: JewelleryItem }) => (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm border-stone-200">
      <div className="relative">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.title}
            className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-64 bg-gradient-to-br from-stone-100 to-stone-200 flex items-center justify-center">
            <div className="text-center text-stone-400">
              <div className="text-4xl mb-2">📷</div>
              <p className="text-sm">No image available</p>
            </div>
          </div>
        )}
        
        {item.is_featured && (
          <Badge className="absolute top-2 left-2 bg-amber-500 text-white">
            <Star className="w-3 h-3 mr-1" />
            Featured
          </Badge>
        )}
        
        <Button
          variant="secondary"
          size="sm"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => setSelectedItem(item)}
        >
          <Eye className="w-4 h-4" />
        </Button>
      </div>
      
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-serif text-stone-800">{item.title}</CardTitle>
          <Badge variant="outline" className="text-xs">
            {formatCategoryLabel(item.category)}
          </Badge>
        </div>
        <CardDescription className="text-stone-600 line-clamp-2">
          {item.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-2 text-sm text-stone-600">
          <div>
            <span className="font-medium">Materials:</span> {item.materials}
          </div>
          <div>
            <span className="font-medium">Size:</span> {item.size}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const ItemListView = ({ item }: { item: JewelleryItem }) => (
    <Card className="p-4 hover:shadow-md transition-shadow bg-white/80 backdrop-blur-sm border-stone-200">
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.title}
              className="w-20 h-20 object-cover rounded-md"
            />
          ) : (
            <div className="w-20 h-20 bg-stone-200 rounded-md flex items-center justify-center">
              <span className="text-stone-400 text-2xl">📷</span>
            </div>
          )}
        </div>
        
        <div className="flex-grow">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-serif font-semibold text-stone-800 flex items-center gap-2">
              {item.title}
              {item.is_featured && (
                <Star className="w-4 h-4 text-amber-500 fill-current" />
              )}
            </h3>
            <Badge variant="outline" className="text-xs">
              {formatCategoryLabel(item.category)}
            </Badge>
          </div>
          
          <p className="text-stone-600 text-sm mb-2 line-clamp-1">
            {item.description}
          </p>
          
          <div className="flex gap-4 text-xs text-stone-500">
            <span><strong>Materials:</strong> {item.materials}</span>
            <span><strong>Size:</strong> {item.size}</span>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSelectedItem(item)}
        >
          <Eye className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-serif font-bold text-stone-800">
          Portfolio
        </h1>
        <p className="text-lg text-stone-600 max-w-2xl mx-auto">
          Discover our collection of handcrafted contemporary jewellery pieces, 
          each designed with meticulous attention to detail and artistic vision.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-stone-200">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.value}
                variant={selectedCategory === category.value ? "default" : "outline"}
                size="sm"
                className={`${
                  selectedCategory === category.value
                    ? 'bg-amber-500 hover:bg-amber-600 text-white'
                    : 'text-stone-600 hover:text-stone-800 border-stone-300'
                }`}
                onClick={() => setSelectedCategory(category.value)}
              >
                <span className="mr-2">{category.emoji}</span>
                {category.label}
              </Button>
            ))}
          </div>

          {/* View Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className={`${
                showFeaturedOnly ? 'bg-amber-100 text-amber-800 border-amber-300' : ''
              }`}
              onClick={() => setShowFeaturedOnly(!showFeaturedOnly)}
            >
              <Star className="w-4 h-4 mr-1" />
              Featured Only
            </Button>
            
            <div className="flex rounded-md border border-stone-300 overflow-hidden">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                className="rounded-none"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                className="rounded-none"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Items Display */}
      {loading ? (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
          : 'space-y-4'
        }>
          {Array.from({ length: 8 }).map((_, i) => (
            <ItemSkeleton key={i} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">💍</div>
          <h3 className="text-xl font-semibold text-stone-800 mb-2">
            No items found
          </h3>
          <p className="text-stone-600">
            {selectedCategory !== 'all' || showFeaturedOnly
              ? 'Try adjusting your filters to see more items.'
              : 'No jewellery items have been added yet.'}
          </p>
        </div>
      ) : (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
          : 'space-y-4'
        }>
          {items.map((item: JewelleryItem) => (
            <div key={item.id}>
              {viewMode === 'grid' ? (
                <ItemCard item={item} />
              ) : (
                <ItemListView item={item} />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Item Detail Modal */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedItem && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-serif flex items-center gap-2">
                  {selectedItem.title}
                  {selectedItem.is_featured && (
                    <Star className="w-5 h-5 text-amber-500 fill-current" />
                  )}
                </DialogTitle>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  {selectedItem.image_url ? (
                    <img
                      src={selectedItem.image_url}
                      alt={selectedItem.title}
                      className="w-full h-80 md:h-96 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-80 md:h-96 bg-stone-200 rounded-lg flex items-center justify-center">
                      <div className="text-center text-stone-400">
                        <div className="text-6xl mb-4">📷</div>
                        <p>No image available</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <Badge variant="outline">
                    {formatCategoryLabel(selectedItem.category)}
                  </Badge>
                  
                  <div>
                    <h4 className="font-semibold text-stone-800 mb-2">Description</h4>
                    <p className="text-stone-600">{selectedItem.description}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-stone-800 mb-2">Materials</h4>
                    <p className="text-stone-600">{selectedItem.materials}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-stone-800 mb-2">Size</h4>
                    <p className="text-stone-600">{selectedItem.size}</p>
                  </div>
                  
                  <div className="text-sm text-stone-500">
                    <p>Created: {selectedItem.created_at.toLocaleDateString()}</p>
                    {selectedItem.updated_at.getTime() !== selectedItem.created_at.getTime() && (
                      <p>Updated: {selectedItem.updated_at.toLocaleDateString()}</p>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}