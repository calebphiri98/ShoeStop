import React, { useState, useEffect } from 'react';
import API_URL from '../../config/api';

const AdminProducts = ({ token }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // New Product Form State - Defaulted to matching your storefront style nodes
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newCategory, setNewCategory] = useState('Men'); 
  
  // Image handling state: 'url' or 'file'
  const [imageSourceType, setImageSourceType] = useState('url'); 
  const [newImageLink, setNewImageLink] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Inline Price Editing States
  const [editingProductId, setEditingProductId] = useState(null);
  const [editPriceValue, setEditPriceValue] = useState('');

  // Fetch Core Catalog Products
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/products`);
      if (!res.ok) throw new Error('Failed to synchronize product catalog directory.');
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Helper: Handles file uploads to backend storage asset pipeline
  const uploadImageFile = async () => {
    if (!selectedFile) return null;
    
    const formData = new FormData();
    formData.append('image', selectedFile); 

    const res = await fetch(`${API_URL}/api/products/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!res.ok) throw new Error('Asset upload engine rejected file formatting.');
    const data = await res.json();
    return data.url || data.image_url; 
  };

  // Handler: Add New Product Form Submission
  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newName || !newPrice) return alert("Please fill out primary required parameters.");

    setUploadingImage(true);
    try {
      let finalImageUrl = 'https://via.placeholder.com/150';

      if (imageSourceType === 'file' && selectedFile) {
        const uploadedUrl = await uploadImageFile();
        if (uploadedUrl) finalImageUrl = uploadedUrl;
      } else if (imageSourceType === 'url' && newImageLink) {
        finalImageUrl = newImageLink;
      }

      const res = await fetch(`${API_URL}/api/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newName,
          price: Number(newPrice),
          images: [finalImageUrl], 
          category: newCategory
        })
      });

      if (!res.ok) throw new Error('Database product injection failed.');
      
      alert(`Successfully registered ${newName} into system repository.`);
      
      // Reset input fields
      setNewName('');
      setNewPrice('');
      setNewImageLink('');
      setSelectedFile(null);
      fetchProducts();
    } catch (err) {
      alert(err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  // Handler: Patch Updated Pricing
  const handleUpdatePrice = async (productId) => {
    if (!editPriceValue || isNaN(editPriceValue)) return alert("Please enter a valid numeric value.");
    
    const cleanId = String(productId).replace('#', '');
    try {
      const res = await fetch(`${API_URL}/api/products/${cleanId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ price: Number(editPriceValue) })
      });

      if (!res.ok) throw new Error('Target matrix price modification synchronization rejected.');

      alert("Price parameters updated successfully.");
      setEditingProductId(null);
      fetchProducts();
    } catch (err) {
      alert(err.message);
    }
  };

  // 🗑️ Handler: Delete Target Product Record safely via API pipeline execution
  const handleDeleteProduct = async (productId, productName) => {
    const checkConfirmation = window.confirm(`Are you sure you want to permanently delete "${productName}" from inventory? This action is irreversible.`);
    if (!checkConfirmation) return;

    const cleanId = String(productId).replace('#', '');
    try {
      const res = await fetch(`${API_URL}/api/products/${cleanId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error('System registry failed to process target product deletion lifecycle.');

      alert('Item entry completely purged from collection registry.');
      fetchProducts(); // Refresh visual matrix parameters dynamically
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* LEFT COLUMN: ADD NEW PRODUCT FORM */}
      <div className="bg-white p-6 shadow-sm border border-gray-100 h-fit rounded lg:col-span-1">
        <h3 className="text-md font-bold uppercase tracking-wide text-primary mb-4 border-b border-gray-100 pb-2">
          ➕ Inject New Product
        </h3>
        <form onSubmit={handleAddProduct} className="space-y-4 text-sm font-medium">
          <div>
            <label className="block text-gray-500 uppercase text-xs font-bold tracking-wider mb-1">Product Title</label>
            <input 
              type="text" value={newName} onChange={(e) => setNewName(e.target.value)}
              className="w-full border border-gray-200 p-2 text-primary focus:outline-none focus:border-primary rounded" 
              placeholder="e.g. Air Jordan Retro Premium" required
            />
          </div>
          <div>
            <label className="block text-gray-500 uppercase text-xs font-bold tracking-wider mb-1">Base Valuation Price (MK)</label>
            <input 
              type="number" step="0.01" value={newPrice} onChange={(e) => setNewPrice(e.target.value)}
              className="w-full border border-gray-200 p-2 text-primary focus:outline-none focus:border-primary rounded" 
              placeholder="e.g. 45000" required
            />
          </div>
          
          {/* IMAGE SELECTION TYPE TABS */}
          <div>
            <label className="block text-gray-500 uppercase text-xs font-bold tracking-wider mb-2">Product Image Asset</label>
            <div className="flex gap-2 mb-2">
              <button
                type="button"
                onClick={() => setImageSourceType('url')}
                className={`flex-1 py-1 text-xs uppercase tracking-wider font-bold border ${imageSourceType === 'url' ? 'bg-primary text-secondary border-primary' : 'bg-transparent text-gray-400 border-gray-200'}`}
              >
                Link URL
              </button>
              <button
                type="button"
                onClick={() => setImageSourceType('file')}
                className={`flex-1 py-1 text-xs uppercase tracking-wider font-bold border ${imageSourceType === 'file' ? 'bg-primary text-secondary border-primary' : 'bg-transparent text-gray-400 border-gray-200'}`}
              >
                Upload File
              </button>
            </div>

            {imageSourceType === 'url' ? (
              <input 
                type="text" value={newImageLink} onChange={(e) => setNewImageLink(e.target.value)}
                className="w-full border border-gray-200 p-2 text-primary focus:outline-none focus:border-primary rounded" 
                placeholder="https://img-url-address.com/shoe.jpg"
              />
            ) : (
              <div className="border-2 border-dashed border-gray-200 rounded p-4 text-center cursor-pointer hover:border-primary transition-colors relative">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <p className="text-xs text-gray-400 truncate font-semibold">
                  {selectedFile ? `📂 ${selectedFile.name}` : '📥 Click or drag image file here'}
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-gray-500 uppercase text-xs font-bold tracking-wider mb-1">Inventory Category Node</label>
            <select 
              value={newCategory} onChange={(e) => setNewCategory(e.target.value)}
              className="w-full border border-gray-200 p-2 text-primary font-bold focus:outline-none focus:border-primary bg-white rounded"
            >
              <option value="Men">Men</option>
              <option value="Women">Women</option>
              <option value="Unisex">Unisex</option>
            </select>
          </div>
          
          <button 
            type="submit" 
            disabled={uploadingImage}
            className="w-full bg-primary text-secondary p-2 font-bold uppercase text-xs tracking-wider transition-all hover:bg-black disabled:bg-gray-400"
          >
            {uploadingImage ? 'Processing Data Matrix...' : 'Commit Entry Data'}
          </button>
        </form>
      </div>

      {/* RIGHT COLUMN: CATALOG DIRECTORY WITH PRICE MODIFIERS */}
      <div className="bg-white p-6 shadow-sm border border-gray-100 rounded lg:col-span-2 overflow-hidden">
        <h3 className="text-md font-bold uppercase tracking-wide text-primary mb-4 border-b border-gray-100 pb-2">
          🏷️ Manage Inventory Matrix ({products.length})
        </h3>

        {loading ? (
          <p className="text-gray-500 py-4 text-sm font-medium">Re-indexing database products...</p>
        ) : products.length === 0 ? (
          <p className="text-gray-400 py-4 text-sm italic">No records exist in active collection directory.</p>
        ) : (
          <div className="overflow-x-auto text-sm">
            <table className="w-full text-left min-w-[500px]">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase text-xs bg-neutralBg">
                  <th className="p-3">Item</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Active Price</th>
                  <th className="p-3 text-right">Adjustment Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const pId = product.id || product._id;
                  const isEditing = editingProductId === pId;

                  const renderImageSource = product.images && Array.isArray(product.images) && product.images.length > 0
                    ? product.images[0]
                    : (product.image_url || product.image || 'https://via.placeholder.com/40');

                  return (
                    <tr key={pId} className="border-b border-gray-50 hover:bg-neutralBg/30 transition-colors">
                      <td className="p-3 flex items-center gap-3">
                        <img 
                          src={renderImageSource} 
                          alt={product.name} 
                          className="w-10 h-10 object-cover rounded bg-neutralBg border"
                          onError={(e) => { e.target.src = 'https://via.placeholder.com/40' }}
                        />
                        <span className="font-semibold text-primary">{product.name}</span>
                      </td>
                      <td className="p-3 text-gray-500 uppercase text-xs font-bold tracking-wider">{product.category}</td>
                      <td className="p-3 font-mono font-bold text-primary">
                        {isEditing ? (
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-400">MK</span>
                            <input 
                              type="number" step="0.01" value={editPriceValue}
                              onChange={(e) => setEditPriceValue(e.target.value)}
                              className="w-24 border border-primary p-1 text-xs focus:outline-none"
                              autoFocus
                            />
                          </div>
                        ) : (
                          `MK ${Number(product.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                        )}
                      </td>
                      <td className="p-3 text-right">
                        {isEditing ? (
                          <div className="inline-flex gap-1.5">
                            <button 
                              onClick={() => handleUpdatePrice(pId)}
                              className="bg-emerald-600 text-white text-[11px] font-bold px-2 py-1 uppercase rounded hover:bg-emerald-700"
                            >
                              Save
                            </button>
                            <button 
                              onClick={() => setEditingProductId(null)}
                              className="bg-gray-200 text-primary text-[11px] font-bold px-2 py-1 uppercase rounded hover:bg-gray-300"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="inline-flex gap-2">
                            <button 
                              onClick={() => {
                                setEditingProductId(pId);
                                setEditPriceValue(product.price);
                              }}
                              className="text-xs font-bold uppercase tracking-wider text-accent bg-primary px-3 py-1 hover:bg-black transition-colors"
                            >
                              ✏️ Price
                            </button>
                            {/* ⚡ THE DELETION COMPONENT ROUTE BUTTON */}
                            <button 
                              onClick={() => handleDeleteProduct(pId, product.name)}
                              className="text-xs font-bold uppercase tracking-wider text-white bg-red-600 px-3 py-1 hover:bg-red-700 transition-colors"
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProducts;
