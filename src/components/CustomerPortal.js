import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Package, MessageSquare, Camera, UtensilsCrossed, Cake, Palette, Layout, Plus, Send, Check, X, Edit2, Save, ChevronLeft, ChevronRight, Star, Phone, Mail, MapPin, AlertCircle, CheckCircle } from 'lucide-react';

const CustomerPortal = () => {
  // Mock customer data - in real app this would come from backend
  const [customerData, setCustomerData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@email.com',
    phone: '(305) 555-1234',
    eventDetails: {
      eventId: 'EV2024001',
      venue: 'Diamond Doral',
      packageType: 'platinum',
      eventType: 'Wedding',
      date: '2025-07-15',
      time: '6:00 PM - 11:00 PM',
      guestCount: 120,
      contractedGuests: 100,
      status: 'confirmed',
      totalAmount: 12495,
      paidAmount: 6247.50,
      remainingAmount: 6247.50,
      addOns: ['photoVideo', 'photobooth', 'crazyHour']
    }
  });

  const [activeTab, setActiveTab] = useState('overview');
  const [editingGuests, setEditingGuests] = useState(false);
  const [tempGuestCount, setTempGuestCount] = useState(customerData.eventDetails.guestCount);
  const [selectedMenu, setSelectedMenu] = useState('classic');
  const [selectedCake, setSelectedCake] = useState('vanilla');
  const [selectedDecoration, setSelectedDecoration] = useState('elegant');
  const [tableLayout, setTableLayout] = useState('round8');
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  // Gallery states
  const [foodGalleryIndex, setFoodGalleryIndex] = useState(0);
  const [cakeGalleryIndex, setCakeGalleryIndex] = useState(0);
  const [decorGalleryIndex, setDecorGalleryIndex] = useState(0);

  // Mock data for options
  const menuOptions = {
    classic: {
      name: 'Classic Menu',
      appetizer: 'Caesar Salad',
      main: 'Grilled Chicken Breast',
      sides: ['Garlic Mashed Potatoes', 'Seasonal Vegetables'],
      dessert: 'Tiramisu',
      images: [
        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
        'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400',
        'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400'
      ]
    },
    premium: {
      name: 'Premium Menu',
      appetizer: 'Shrimp Cocktail',
      main: 'Filet Mignon',
      sides: ['Truffle Risotto', 'Grilled Asparagus'],
      dessert: 'Chocolate Lava Cake',
      images: [
        'https://images.unsplash.com/photo-1562113530-57ba467cea38?w=400',
        'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400',
        'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=400'
      ]
    },
    vegetarian: {
      name: 'Vegetarian Menu',
      appetizer: 'Caprese Salad',
      main: 'Eggplant Parmesan',
      sides: ['Wild Rice Pilaf', 'Roasted Root Vegetables'],
      dessert: 'Fresh Fruit Tart',
      images: [
        'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400',
        'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
        'https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=400'
      ]
    }
  };

  const cakeOptions = {
    vanilla: {
      name: 'Classic Vanilla',
      description: '3-tier vanilla cake with buttercream frosting',
      serves: '100-120 guests',
      images: [
        'https://images.unsplash.com/photo-1535141192574-5d4897c12636?w=400',
        'https://images.unsplash.com/photo-1557925923-cd4648e211a0?w=400',
        'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=400'
      ]
    },
    chocolate: {
      name: 'Decadent Chocolate',
      description: '3-tier chocolate cake with ganache',
      serves: '100-120 guests',
      images: [
        'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400',
        'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=400',
        'https://images.unsplash.com/photo-1569864358642-9d1684040f43?w=400'
      ]
    },
    redVelvet: {
      name: 'Red Velvet Dream',
      description: '3-tier red velvet with cream cheese frosting',
      serves: '100-120 guests',
      images: [
        'https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?w=400',
        'https://images.unsplash.com/photo-1616541823729-00fe0aacd32c?w=400',
        'https://images.unsplash.com/photo-1602351447937-745cb720612f?w=400'
      ]
    }
  };

  const decorationThemes = {
    elegant: {
      name: 'Elegant Classic',
      description: 'White and gold theme with crystal accents',
      includes: ['Centerpieces', 'Uplighting', 'Draping', 'Stage Decor'],
      images: [
        'https://images.unsplash.com/photo-1519741497674-611481863552?w=400',
        'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=400',
        'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400'
      ]
    },
    romantic: {
      name: 'Romantic Garden',
      description: 'Soft pink and ivory with floral arrangements',
      includes: ['Rose Centerpieces', 'Fairy Lights', 'Garden Props', 'Floral Arch'],
      images: [
        'https://images.unsplash.com/photo-1525772764200-be829a350797?w=400',
        'https://images.unsplash.com/photo-1510076857177-7470076d4098?w=400',
        'https://images.unsplash.com/photo-1522413452208-996ff3f3e740?w=400'
      ]
    },
    modern: {
      name: 'Modern Chic',
      description: 'Black, white, and silver minimalist design',
      includes: ['LED Centerpieces', 'Geometric Decor', 'Modern Lighting', 'Acrylic Elements'],
      images: [
        'https://images.unsplash.com/photo-1549451371-64aa98a6f660?w=400',
        'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400',
        'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400'
      ]
    }
  };

  const tableLayouts = {
    round8: { name: 'Round Tables (8 guests)', description: '15 round tables with 8 guests each' },
    round10: { name: 'Round Tables (10 guests)', description: '12 round tables with 10 guests each' },
    long: { name: 'Long Banquet Tables', description: '6 long tables with 20 guests each' },
    mixed: { name: 'Mixed Layout', description: 'Combination of round and rectangular tables' },
    uShape: { name: 'U-Shape Layout', description: 'U-shaped configuration for better interaction' }
  };

  // Load comments from localStorage on component mount
  useEffect(() => {
    const savedComments = localStorage.getItem('customerComments');
    if (savedComments) {
      setComments(JSON.parse(savedComments));
    }
  }, []);

  // Save comments to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('customerComments', JSON.stringify(comments));
  }, [comments]);

  const handleGuestUpdate = () => {
    if (tempGuestCount !== customerData.eventDetails.guestCount) {
      setCustomerData({
        ...customerData,
        eventDetails: {
          ...customerData.eventDetails,
          guestCount: tempGuestCount
        }
      });
      showNotificationMessage('Guest count updated successfully! Our team will contact you about any price adjustments.');
    }
    setEditingGuests(false);
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment = {
        id: Date.now(),
        text: newComment,
        timestamp: new Date().toISOString(),
        author: 'Customer',
        status: 'pending'
      };
      setComments([...comments, comment]);
      setNewComment('');
      showNotificationMessage('Comment added successfully! Our team will respond within 24 hours.');
    }
  };

  const showNotificationMessage = (message) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 5000);
  };

  const calculateDaysUntilEvent = () => {
    const eventDate = new Date(customerData.eventDetails.date);
    const today = new Date();
    const diffTime = eventDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const ImageGallery = ({ images, currentIndex, onPrevious, onNext }) => (
    <div className="relative">
      <img 
        src={images[currentIndex]} 
        alt="Gallery" 
        className="w-full h-64 object-cover rounded-lg"
      />
      <button
        onClick={onPrevious}
        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 p-2 rounded-full hover:bg-white transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={onNext}
        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 p-2 rounded-full hover:bg-white transition-colors"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
        {images.map((_, idx) => (
          <div
            key={idx}
            className={`w-2 h-2 rounded-full ${idx === currentIndex ? 'bg-white' : 'bg-white/50'}`}
          />
        ))}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg">
              <h2 className="text-2xl font-bold mb-2">Welcome, {customerData.firstName}!</h2>
              <p className="text-lg">Your {customerData.eventDetails.eventType} is in {calculateDaysUntilEvent()} days</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  Event Details
                </h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Event ID:</strong> {customerData.eventDetails.eventId}</p>
                  <p><strong>Type:</strong> {customerData.eventDetails.eventType}</p>
                  <p><strong>Date:</strong> {new Date(customerData.eventDetails.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  <p><strong>Time:</strong> {customerData.eventDetails.time}</p>
                  <p><strong>Venue:</strong> {customerData.eventDetails.venue}</p>
                  <p><strong>Package:</strong> {customerData.eventDetails.packageType.charAt(0).toUpperCase() + customerData.eventDetails.packageType.slice(1)}</p>
                  <p className="flex items-center gap-2">
                    <strong>Status:</strong> 
                    <span className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      {customerData.eventDetails.status.charAt(0).toUpperCase() + customerData.eventDetails.status.slice(1)}
                    </span>
                  </p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-500" />
                  Guest Information
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Current Guest Count:</span>
                    <div className="flex items-center gap-2">
                      {editingGuests ? (
                        <>
                          <input
                            type="number"
                            value={tempGuestCount}
                            onChange={(e) => setTempGuestCount(parseInt(e.target.value) || 0)}
                            className="w-20 p-1 border rounded"
                            min="1"
                            max="200"
                          />
                          <button onClick={handleGuestUpdate} className="text-green-500">
                            <Check className="w-4 h-4" />
                          </button>
                          <button onClick={() => {
                            setEditingGuests(false);
                            setTempGuestCount(customerData.eventDetails.guestCount);
                          }} className="text-red-500">
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="font-semibold">{customerData.eventDetails.guestCount}</span>
                          <button onClick={() => setEditingGuests(true)} className="text-blue-500">
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span>Contracted Guests:</span>
                    <span>{customerData.eventDetails.contractedGuests}</span>
                  </div>
                  {customerData.eventDetails.guestCount > customerData.eventDetails.contractedGuests && (
                    <p className="text-sm text-orange-600 bg-orange-50 p-2 rounded">
                      <AlertCircle className="w-4 h-4 inline mr-1" />
                      Additional charges apply for {customerData.eventDetails.guestCount - customerData.eventDetails.contractedGuests} extra guests
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5 text-purple-500" />
                  Payment Summary
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total Amount:</span>
                    <span className="font-semibold">${customerData.eventDetails.totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Paid:</span>
                    <span>${customerData.eventDetails.paidAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-orange-600">
                    <span>Remaining:</span>
                    <span className="font-semibold">${customerData.eventDetails.remainingAmount.toLocaleString()}</span>
                  </div>
                  <div className="pt-2 mt-2 border-t">
                    <p className="text-xs text-gray-600">Final payment due 14 days before event</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Phone className="w-5 h-5 text-red-500" />
                  Contact Information
                </h3>
                <div className="space-y-2 text-sm">
                  <p className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    events@diamondvenue.com
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    (305) 555-0123
                  </p>
                  <p className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    8000 NW 36th St, Doral, FL 33166
                  </p>
                  <div className="pt-2 mt-2 border-t">
                    <p className="text-xs text-gray-600">Event Coordinator: Maria Rodriguez</p>
                    <p className="text-xs text-gray-600">Direct: (305) 555-0124</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'menu':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Menu Selection</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(menuOptions).map(([key, menu]) => (
                <div 
                  key={key}
                  className={`bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-all
                    ${selectedMenu === key ? 'ring-2 ring-blue-500' : 'hover:shadow-lg'}`}
                  onClick={() => {
                    setSelectedMenu(key);
                    showNotificationMessage(`${menu.name} selected`);
                  }}
                >
                  <ImageGallery
                    images={menu.images}
                    currentIndex={foodGalleryIndex}
                    onPrevious={() => setFoodGalleryIndex((prev) => (prev - 1 + menu.images.length) % menu.images.length)}
                    onNext={() => setFoodGalleryIndex((prev) => (prev + 1) % menu.images.length)}
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{menu.name}</h3>
                    <div className="text-sm space-y-1 text-gray-600">
                      <p><strong>Appetizer:</strong> {menu.appetizer}</p>
                      <p><strong>Main:</strong> {menu.main}</p>
                      <p><strong>Sides:</strong> {menu.sides.join(', ')}</p>
                      <p><strong>Dessert:</strong> {menu.dessert}</p>
                    </div>
                    {selectedMenu === key && (
                      <div className="mt-3 flex items-center gap-1 text-green-600">
                        <Check className="w-4 h-4" />
                        <span className="text-sm font-medium">Selected</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm">
                <strong>Note:</strong> Special dietary requirements? Let us know in the comments section. 
                We can accommodate vegetarian, vegan, gluten-free, and other dietary needs.
              </p>
            </div>
          </div>
        );

      case 'cake':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Cake Selection</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(cakeOptions).map(([key, cake]) => (
                <div 
                  key={key}
                  className={`bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-all
                    ${selectedCake === key ? 'ring-2 ring-blue-500' : 'hover:shadow-lg'}`}
                  onClick={() => {
                    setSelectedCake(key);
                    showNotificationMessage(`${cake.name} selected`);
                  }}
                >
                  <ImageGallery
                    images={cake.images}
                    currentIndex={cakeGalleryIndex}
                    onPrevious={() => setCakeGalleryIndex((prev) => (prev - 1 + cake.images.length) % cake.images.length)}
                    onNext={() => setCakeGalleryIndex((prev) => (prev + 1) % cake.images.length)}
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{cake.name}</h3>
                    <p className="text-sm text-gray-600 mb-1">{cake.description}</p>
                    <p className="text-sm text-gray-500">{cake.serves}</p>
                    {selectedCake === key && (
                      <div className="mt-3 flex items-center gap-1 text-green-600">
                        <Check className="w-4 h-4" />
                        <span className="text-sm font-medium">Selected</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-semibold mb-3">Customization Options</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span>Add custom message/names on cake</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span>Special decorative elements (flowers, toppers, etc.)</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span>Additional sheet cakes for larger guest count</span>
                </label>
              </div>
            </div>
          </div>
        );

      case 'decoration':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Decoration Theme</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(decorationThemes).map(([key, theme]) => (
                <div 
                  key={key}
                  className={`bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-all
                    ${selectedDecoration === key ? 'ring-2 ring-blue-500' : 'hover:shadow-lg'}`}
                  onClick={() => {
                    setSelectedDecoration(key);
                    showNotificationMessage(`${theme.name} theme selected`);
                  }}
                >
                  <ImageGallery
                    images={theme.images}
                    currentIndex={decorGalleryIndex}
                    onPrevious={() => setDecorGalleryIndex((prev) => (prev - 1 + theme.images.length) % theme.images.length)}
                    onNext={() => setDecorGalleryIndex((prev) => (prev + 1) % theme.images.length)}
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{theme.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{theme.description}</p>
                    <div className="space-y-1">
                      {theme.includes.map((item, idx) => (
                        <p key={idx} className="text-sm text-gray-500 flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          {item}
                        </p>
                      ))}
                    </div>
                    {selectedDecoration === key && (
                      <div className="mt-3 flex items-center gap-1 text-green-600">
                        <Check className="w-4 h-4" />
                        <span className="text-sm font-medium">Selected</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-semibold mb-4">Table Layout</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(tableLayouts).map(([key, layout]) => (
                  <label key={key} className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="tableLayout"
                      value={key}
                      checked={tableLayout === key}
                      onChange={(e) => {
                        setTableLayout(e.target.value);
                        showNotificationMessage(`${layout.name} selected`);
                      }}
                      className="mt-1"
                    />
                    <div>
                      <p className="font-medium">{layout.name}</p>
                      <p className="text-sm text-gray-600">{layout.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 'comments':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Comments & Requests</h2>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex gap-2 mb-6">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                  placeholder="Add a comment or special request..."
                  className="flex-1 p-3 border rounded-lg"
                />
                <button
                  onClick={handleAddComment}
                  className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Send
                </button>
              </div>

              <div className="space-y-4">
                {comments.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No comments yet. Feel free to share any special requests or questions!</p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="border-b pb-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-gray-500" />
                          <span className="font-medium">{comment.author}</span>
                          <span className="text-sm text-gray-500">
                            {new Date(comment.timestamp).toLocaleDateString()} at {new Date(comment.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          comment.status === 'responded' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {comment.status === 'responded' ? 'Responded' : 'Pending'}
                        </span>
                      </div>
                      <p className="text-gray-700 ml-6">{comment.text}</p>
                      {comment.response && (
                        <div className="ml-6 mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm font-medium text-gray-600 mb-1">Venue Response:</p>
                          <p className="text-sm text-gray-700">{comment.response}</p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Common Requests</h3>
              <ul className="text-sm space-y-1 text-gray-700">
                <li>• Special dietary requirements or allergies</li>
                <li>• Specific music requests or do-not-play list</li>
                <li>• Special arrangements for elderly guests</li>
                <li>• Photography preferences or restricted areas</li>
                <li>• Timeline adjustments or special moments</li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Diamond Venue Portal</h1>
              <p className="text-sm text-gray-600">Event #{customerData.eventDetails.eventId}</p>
            </div>
            <div className="text-right">
              <p className="font-medium">{customerData.firstName} {customerData.lastName}</p>
              <p className="text-sm text-gray-600">{customerData.email}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: Package },
              { id: 'menu', label: 'Menu', icon: UtensilsCrossed },
              { id: 'cake', label: 'Cake', icon: Cake },
              { id: 'decoration', label: 'Decoration', icon: Palette },
              { id: 'comments', label: 'Comments', icon: MessageSquare }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 transition-colors whitespace-nowrap
                    ${activeTab === tab.id 
                      ? 'border-blue-500 text-blue-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>

      {/* Notification */}
      {showNotification && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-slideIn">
          <CheckCircle className="w-5 h-5" />
          {notificationMessage}
        </div>
      )}

      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default CustomerPortal;