"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/pixelact-ui/button';
import { Input } from '@/components/ui/pixelact-ui/input';
import Card from '@/components/ui/pixelact-ui/card';
import GridSelector from '@/components/GridSelector';

type MediaType = 'image' | 'video';

// Edit Ad Modal Component
function EditAdModal({ ad, onSave, onClose }: { ad: any; onSave: (data: any) => void; onClose: () => void }) {
  const [about, setAbout] = useState(ad.about || '');
  const [ctaUrl, setCtaUrl] = useState(ad.ctaUrl || '');
  const [hideFromTime, setHideFromTime] = useState(ad.hideFromTime || '');
  const [hideToTime, setHideToTime] = useState(ad.hideToTime || '');
  const [isActive, setIsActive] = useState(ad.isActive);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      about,
      ctaUrl,
      hideFromTime,
      hideToTime,
      isActive
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md p-6">
        <h3 className="text-gray-300 text-lg mb-4">Edit Ad</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-300 text-xs mb-2" htmlFor="edit-about">About what you offer</label>
            <textarea
              id="edit-about"
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              placeholder="Describe what you offer..."
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-gray-300 text-xs mb-2" htmlFor="edit-cta">Call-to-action URL</label>
            <Input
              id="edit-cta"
              type="url"
              value={ctaUrl}
              onChange={(e) => setCtaUrl(e.target.value)}
              placeholder="https://example.com"
            />
          </div>

          <div>
            <label className="block text-gray-300 text-xs mb-2" htmlFor="edit-hideFromTime">Hide ad from time</label>
            <Input
              id="edit-hideFromTime"
              type="time"
              value={hideFromTime}
              onChange={(e) => setHideFromTime(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-gray-300 text-xs mb-2" htmlFor="edit-hideToTime">Hide ad until time</label>
            <Input
              id="edit-hideToTime"
              type="time"
              value={hideToTime}
              onChange={(e) => setHideToTime(e.target.value)}
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-gray-300 text-sm">
              <input 
                type="checkbox" 
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              Active (ad is visible on the grid)
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" variant="pixel-green" className="flex-1">
              Save Changes
            </Button>
            <Button type="button" variant="red" onClick={onClose} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default function AdvertiserDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [pixelCount, setPixelCount] = useState(0);
  const [hideFromTime, setHideFromTime] = useState('');
  const [hideToTime, setHideToTime] = useState('');
  const [mediaType, setMediaType] = useState<MediaType>('image');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [about, setAbout] = useState('');
  const [ctaUrl, setCtaUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedCells, setSelectedCells] = useState<Array<{ x: number; y: number }>>([]);
  const [clickPosition, setClickPosition] = useState<{ x: number; y: number } | null>(null);
  const [activeAds, setActiveAds] = useState<any[]>([]);
  const [userAds, setUserAds] = useState<any[]>([]);
  const [editingAd, setEditingAd] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Auto-generate selected cells based on pixel count and click position
  useEffect(() => {
    if (clickPosition && pixelCount > 0) {
      const cells: Array<{ x: number; y: number }> = [];
      
      // Calculate how many cells to place horizontally and vertically
      const sqrt = Math.sqrt(pixelCount);
      const width = Math.ceil(sqrt);
      const height = Math.ceil(pixelCount / width);
      
      console.log(`Creating ${pixelCount} pixel ad: ${width}x${height} grid starting at (${clickPosition.x}, ${clickPosition.y})`);
      
      // Start from click position and place cells in a rectangular pattern
      for (let i = 0; i < pixelCount; i++) {
        const row = Math.floor(i / width);
        const col = i % width;
        cells.push({
          x: clickPosition.x + col,
          y: clickPosition.y + row
        });
      }
      
      // Log the bounding box
      const minX = Math.min(...cells.map(cell => cell.x));
      const maxX = Math.max(...cells.map(cell => cell.x));
      const minY = Math.min(...cells.map(cell => cell.y));
      const maxY = Math.max(...cells.map(cell => cell.y));
      console.log(`Ad will span from (${minX}, ${minY}) to (${maxX}, ${maxY})`);
      
      setSelectedCells(cells);
    }
  }, [clickPosition, pixelCount]);

  // Check authentication on mount
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/auth?mode=login');
      return;
    }
    setUser(JSON.parse(userData));
  }, [router]);

  // Fetch active ads for dashboard grid
  useEffect(() => {
    const fetchAds = async () => {
      try {
        const response = await fetch('/api/ads/active');
        if (response.ok) {
          const data = await response.json();
          setActiveAds(data.ads || []);
        }
      } catch (error) {
        console.error('Failed to fetch ads:', error);
      }
    };
    
    fetchAds();
    // Refresh ads every 30 seconds
    const interval = setInterval(fetchAds, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fetch user's ads
  useEffect(() => {
    const fetchUserAds = async () => {
      if (!user) return;
      
      try {
        const response = await fetch(`/api/ads/user?userId=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setUserAds(data.ads || []);
        }
      } catch (error) {
        console.error('Failed to fetch user ads:', error);
      }
    };
    
    fetchUserAds();
  }, [user]);


  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/auth?mode=login');
  };

  const handleEditAd = (ad: any) => {
    setEditingAd(ad);
    setShowEditModal(true);
  };

  const handleUpdateAd = async (updatedData: any) => {
    try {
      const response = await fetch('/api/ads/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adId: editingAd.id,
          ...updatedData
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update ad');
      }

      // Refresh user ads
      const userAdsResponse = await fetch(`/api/ads/user?userId=${user.id}`);
      if (userAdsResponse.ok) {
        const data = await userAdsResponse.json();
        setUserAds(data.ads || []);
      }

      setShowEditModal(false);
      setEditingAd(null);
      alert('Ad updated successfully!');
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleDeleteAd = async (adId: string) => {
    if (!confirm('Are you sure you want to delete this ad? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/ads/delete?adId=${adId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete ad');
      }

      // Refresh user ads
      const userAdsResponse = await fetch(`/api/ads/user?userId=${user.id}`);
      if (userAdsResponse.ok) {
        const data = await userAdsResponse.json();
        setUserAds(data.ads || []);
      }

      alert('Ad deleted successfully!');
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    if (f) {
      const url = URL.createObjectURL(f);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (pixelCount > 100) {
      alert('Maximum pixel limit is 100. Please reduce your pixel count.');
      return;
    }
    
    if (selectedCells.length === 0) {
      alert('Please click on the grid to select a position for your ad.');
      return;
    }
    
    if (!file) {
      alert('Please upload an image or video.');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('userId', user.id);
      formData.append('about', about);
      formData.append('ctaUrl', ctaUrl);
      formData.append('mediaType', mediaType);
      formData.append('hideFromTime', hideFromTime);
      formData.append('hideToTime', hideToTime);
      formData.append('positions', JSON.stringify(selectedCells));
      formData.append('file', file);

      const response = await fetch('/api/ads/submit', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit ad');
      }

      const result = await response.json();
      alert(`Ad submitted successfully! Your ad will be displayed on ${pixelCount} grid cells.`);
      
      // Redirect to home page (grid)
      router.push('/');
      
      // Reset form
      setSelectedCells([]);
      setClickPosition(null);
      setFile(null);
      setPreviewUrl(null);
      setAbout('');
      setCtaUrl('');
      
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return <div className="center-viewport">Loading...</div>;
  }

  return (
    <div className="min-h-screen p-6 md:p-10">
      {/* Welcome message and logout at top center of page */}
      <div className="flex justify-center items-center gap-4 mb-6">
        <span className="text-gray-300 text-sm">Welcome, {user.name || user.email}</span>
        <Button variant="green" onClick={handleLogout} className="text-xs">Logout</Button>
      </div>
      
      <Card className="w-full max-w-4xl p-8 md:p-10 mx-auto">
        {/* Dashboard title centered in container */}
        <h1 className="neon-heading text-xl md:text-2xl text-center mb-8">Advertiser Dashboard</h1>

        <form onSubmit={submit} className="space-y-8">
          {/* Grid Selection */}
          <div className="space-y-6">
            <h2 className="text-gray-300 text-lg">Grid Selection</h2>
            
            {/* Pixel Count Input */}
            <div className="max-w-xs">
              <label className="block text-gray-300 text-xs mb-2" htmlFor="pixelCount">Number of pixels</label>
              <Input
                id="pixelCount"
                type="number"
                min={0}
                max={100}
                value={pixelCount}
                onChange={(e) => setPixelCount(parseInt(e.target.value || '0', 10))}
              />
              <p className="text-gray-500 text-xs mt-1">How many grid cells you want to occupy. (Max: 100 pixels)</p>
            </div>

            <div className="bg-gray-900/60 border border-gray-700 rounded p-4">
              <p className="text-gray-300 text-sm mb-2">
                <strong>Instructions:</strong> Enter the number of pixels you want above, then click on the grid below to select your ad position. 
                The system will automatically select {pixelCount} adjacent grid cells starting from your click location.
              </p>
              <p className="text-gray-400 text-xs">
                Drag to pan • Scroll to zoom • Click to place your ad
              </p>
              {clickPosition && pixelCount > 0 && (
                <div className="mt-3 p-2 bg-blue-900/30 border border-blue-600 rounded">
                  <p className="text-blue-300 text-xs">
                    <strong>Preview:</strong> Your {pixelCount}-pixel ad will be placed starting at grid position ({clickPosition.x}, {clickPosition.y})
                  </p>
                  <p className="text-blue-400 text-xs mt-1">
                    Ad dimensions: {Math.ceil(Math.sqrt(pixelCount))}x{Math.ceil(pixelCount / Math.ceil(Math.sqrt(pixelCount)))} cells
                  </p>
                </div>
              )}
            </div>
            <GridSelector 
              selectedCells={selectedCells}
              onCellSelect={setClickPosition}
              activeAds={activeAds}
              pixelCount={pixelCount}
            />
          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">

            <div>
              <label className="block text-gray-300 text-xs mb-2" htmlFor="hideFromTime">Hide ad from time</label>
              <Input
                id="hideFromTime"
                type="time"
                value={hideFromTime}
                onChange={(e) => setHideFromTime(e.target.value)}
              />
              <p className="text-gray-500 text-xs mt-1">Time when your ad should be hidden (optional)</p>
            </div>

            <div>
              <label className="block text-gray-300 text-xs mb-2" htmlFor="hideToTime">Hide ad until time</label>
              <Input
                id="hideToTime"
                type="time"
                value={hideToTime}
                onChange={(e) => setHideToTime(e.target.value)}
              />
              <p className="text-gray-500 text-xs mt-1">Time when your ad should be shown again (optional)</p>
            </div>

            <div>
              <label className="block text-gray-300 text-xs mb-2">Media type</label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-gray-300 text-sm">
                  <input type="radio" name="media" value="image" checked={mediaType==='image'} onChange={() => setMediaType('image')} />
                  Image
                </label>
                <label className="flex items-center gap-2 text-gray-300 text-sm">
                  <input type="radio" name="media" value="video" checked={mediaType==='video'} onChange={() => setMediaType('video')} />
                  Video
                </label>
              </div>
            </div>

            <div>
              <label className="block text-gray-300 text-xs mb-2" htmlFor="about">About what you offer</label>
              <textarea
                id="about"
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                placeholder="Describe what you offer..."
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-gray-300 text-xs mb-2" htmlFor="cta">Call-to-action URL</label>
              <Input
                id="cta"
                type="url"
                value={ctaUrl}
                onChange={(e) => setCtaUrl(e.target.value)}
                placeholder="https://example.com"
              />
            </div>

            <Button type="submit" variant="pixel-green" disabled={submitting} className="w-full">
              {submitting ? 'Submitting…' : 'Submit Ad'}
            </Button>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-gray-300 text-xs mb-2" htmlFor="file">Upload {mediaType === 'image' ? 'image' : 'video'}</label>
              <input id="file" type="file" accept={mediaType==='image' ? 'image/*' : 'video/*'} onChange={handleFile} className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-gray-700 file:text-white hover:file:bg-gray-600" />
              <p className="text-gray-500 text-xs mt-1">Max 25MB. Supported formats vary by type.</p>
            </div>
            <div className="bg-gray-900/60 border border-gray-700 rounded-lg aspect-video flex items-center justify-center overflow-hidden">
              {previewUrl ? (
                mediaType === 'image' ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={previewUrl} alt="Preview" className="max-w-full max-h-full object-contain" />
                ) : (
                  <video src={previewUrl} controls className="max-w-full max-h-full object-contain" />
                )
              ) : (
                <span className="text-gray-500 text-sm">Preview will appear here</span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs text-gray-400">
              <div className="bg-gray-900/60 border border-gray-700 rounded p-3">
                <div className="text-gray-300">Pixels</div>
                <div className="mt-1">{pixelCount.toLocaleString()}</div>
              </div>
              <div className="bg-gray-900/60 border border-gray-700 rounded p-3">
                <div className="text-gray-300">Hidden Period</div>
                <div className="mt-1">
                  {hideFromTime && hideToTime ? `${hideFromTime} - ${hideToTime}` : 'Always visible'}
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Ad Management Section */}
        <div className="mt-12 space-y-6">
          <h2 className="text-gray-300 text-lg">Manage Your Ads</h2>
          
          {userAds.length === 0 ? (
            <div className="bg-gray-900/60 border border-gray-700 rounded p-6 text-center">
              <p className="text-gray-400">You haven't created any ads yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {userAds.map((ad) => (
                <div key={ad.id} className="bg-gray-900/60 border border-gray-700 rounded p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-gray-300 font-medium">
                        {ad.about || ad.title || 'Untitled Ad'}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        {ad.positions.length} pixels • {ad.mediaType} • 
                        {ad.isActive ? ' Active' : ' Inactive'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="green" 
                        size="sm"
                        onClick={() => handleEditAd(ad)}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="red" 
                        size="sm"
                        onClick={() => handleDeleteAd(ad.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-400">
                    <div>
                      <div className="text-gray-300">Media Type</div>
                      <div className="mt-1 capitalize">{ad.mediaType}</div>
                    </div>
                    <div>
                      <div className="text-gray-300">Pixels</div>
                      <div className="mt-1">{ad.positions.length}</div>
                    </div>
                    <div>
                      <div className="text-gray-300">Hidden Period</div>
                      <div className="mt-1">
                        {ad.hideFromTime && ad.hideToTime 
                          ? `${ad.hideFromTime} - ${ad.hideToTime}` 
                          : 'Always visible'
                        }
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-300">Status</div>
                      <div className={`mt-1 ${ad.isActive ? 'text-green-400' : 'text-red-400'}`}>
                        {ad.isActive ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                  </div>
                  
                  {ad.ctaUrl && (
                    <div className="mt-3">
                      <div className="text-gray-300 text-xs">CTA URL</div>
                      <a 
                        href={ad.ctaUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 text-xs hover:underline"
                      >
                        {ad.ctaUrl}
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Edit Ad Modal */}
      {showEditModal && editingAd && (
        <EditAdModal
          ad={editingAd}
          onSave={handleUpdateAd}
          onClose={() => {
            setShowEditModal(false);
            setEditingAd(null);
          }}
        />
      )}
    </div>
  );
}


