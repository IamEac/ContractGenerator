import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, DollarSign, Percent, Star, Package, AlertCircle, FileText, Plus, User, Mail, Phone, MapPin, Edit2, Check, X } from 'lucide-react';

const VenuePricingCalculator = () => {
  // State management
  const [customerInfo, setCustomerInfo] = useState({
    firstName: '',
    lastName: '',
    secondLastName: '',
    email: '',
    phone: '',
    address: '',
    city: 'Miami',
    state: 'FL',
    zipCode: '',
    referralSource: '',
    notes: ''
  });

  const [eventDetails, setEventDetails] = useState({
    venue: '',
    packageType: '',
    eventType: '',
    customEventType: '',
    guestCount: 80,
    date: '',
    dayOfWeek: '',
    timeSlot: '',
    customTime: '',
    duration: 4,
    addOns: [],
    discount: 0
  });

  const [showCustomEvent, setShowCustomEvent] = useState(false);
  const [showCustomTime, setShowCustomTime] = useState(false);
  const [editMode, setEditMode] = useState({
    basePrice: false,
    tax: false,
    serviceFee: false,
    addOns: {}
  });

  const [customPricing, setCustomPricing] = useState({
    basePrice: null,
    tax: 7,
    serviceFee: 18,
    addOnPrices: {}
  });

  const [errors, setErrors] = useState({});

  const [pricing, setPricing] = useState({
    basePrice: 0,
    addOnsTotal: 0,
    subtotal: 0,
    tax: 0,
    serviceFee: 0,
    discountAmount: 0,
    total: 0
  });

  // Package definitions with included services
  const packageInclusions = {
    gold: {
      name: 'Gold',
      includes: ['venue', 'setup', 'coordinator', 'waiters', 'bar', 'dinner', 'centerpieces', 'dj', 'uplighting', 'stageDecor', 'tableSettings', 'cake']
    },
    platinum: {
      name: 'Platinum',
      includes: ['venue', 'setup', 'coordinator', 'waiters', 'bar', 'dinner', 'centerpieces', 'dj', 'uplighting', 'stageDecor', 'tableSettings', 'cake', 'cheeseTable', 'decoration']
    },
    diamond: {
      name: 'Diamond',
      includes: ['venue', 'setup', 'coordinator', 'waiters', 'bar', 'dinner', 'centerpieces', 'dj', 'uplighting', 'stageDecor', 'tableSettings', 'cake', 'cheeseTable', 'decoration', 'photoVideo', 'champagne', 'photobooth']
    }
  };

  // Venue data
  const venues = {
    revolution: { 
      name: 'Revolution', 
      locations: ['Doral (60)', 'Kendall (70)'],
      capacity: 60,
      minPrice: 2500
    },
    diamond: { 
      name: 'Diamond', 
      locations: ['Doral (200)'],
      capacity: 80,
      minPrice: 7000
    }
  };

  // Event types
  const eventTypes = {
    wedding: { name: 'Wedding', priceMultiplier: 1.1, includesAlcohol: true },
    quinceanera: { name: 'Quinceañera', priceMultiplier: 1.05, includesAlcohol: true },
    sweet16: { name: 'Sweet 16', priceMultiplier: 1.0, includesAlcohol: false },
    babyShower: { name: 'Baby Shower', priceMultiplier: 0.85, includesAlcohol: false },
    corporate: { name: 'Corporate Event', priceMultiplier: 1.0, includesAlcohol: false },
    birthday: { name: 'Adult Birthday', priceMultiplier: 0.95, includesAlcohol: true },
    kidParty: { name: 'Kids Party', priceMultiplier: 0.8, includesAlcohol: false },
    graduation: { name: 'Graduation', priceMultiplier: 0.9, includesAlcohol: true },
    communion: { name: 'First Communion', priceMultiplier: 0.9, includesAlcohol: false },
    custom: { name: 'Other Event', priceMultiplier: 1.0, includesAlcohol: true }
  };

  // Add-on services with package restrictions
  const addOnServices = [
    { id: 'crazyHour', name: 'Crazy Hour', price: 450, excludePackages: [] },
    { id: 'premiumAlcohol', name: 'Premium Alcohol', price: 18, perPerson: true, excludePackages: [] },
    { id: 'extraHour', name: 'Extra Hour', price: 800, excludePackages: [] },
    { id: 'photoVideo', name: 'Photo and Video', price: 1000, excludePackages: ['diamond'] },
    { id: 'photobooth', name: 'Photobooth', price: 450, excludePackages: ['diamond'] },
    { id: 'appetizers', name: 'Appetizers', price: 6, perPerson: true, excludePackages: [] },
    { id: 'limousine', name: 'Limousine', price: 250, excludePackages: [] },
    { id: 'decoration', name: 'Special Decoration', price: 380, excludePackages: ['platinum', 'diamond'] },
    { id: 'champagne', name: 'Champagne', price: 6, perPerson: true, excludePackages: ['diamond'] },
    { id: 'cheeseTable', name: 'Cheese Table', price: 3.8, perPerson: true, excludePackages: ['platinum', 'diamond'] },
    { id: 'cake', name: 'Custom Cake', price: 150, excludePackages: [] },
    { id: 'dj', name: 'DJ (5 hours)', price: 350, excludePackages: [] },
    { id: 'miniDesserts', name: 'Mini Desserts (min 36)', price: 3, perPerson: true, excludePackages: [] },
    { id: 'masterCeremonies', name: 'Master of Ceremonies', price: 250, excludePackages: [] },
    { id: 'animation', name: 'Animation', price: 250, excludePackages: [] }
  ];

  // Validation functions
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePhone = (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 10;
  };

  const validateCustomerInfo = () => {
    const newErrors = {};
    
    if (!customerInfo.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!customerInfo.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!customerInfo.email.trim()) newErrors.email = 'Email is required';
    else if (!validateEmail(customerInfo.email)) newErrors.email = 'Invalid email format';
    if (!customerInfo.phone.trim()) newErrors.phone = 'Phone is required';
    else if (!validatePhone(customerInfo.phone)) newErrors.phone = 'Invalid phone number';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Format phone number
  const formatPhone = (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  };

  // Helper functions
  const getSeason = (date) => {
    if (!date) return 'mid';
    const month = new Date(date).getMonth() + 1;
    const day = new Date(date).getDate();
    
    if ([10, 11, 12].includes(month) || month === 5 || (month === 6 && day <= 15)) {
      return 'high';
    }
    if (month === 2 || month === 7 || (month === 8 && day <= 15) || (month === 6 && day > 15)) {
      return 'low';
    }
    return 'mid';
  };

  // Get available add-ons based on selected package
  const getAvailableAddOns = () => {
    if (!eventDetails.packageType) return addOnServices;
    
    return addOnServices.filter(addOn => 
      !addOn.excludePackages.includes(eventDetails.packageType)
    );
  };

  // Calculate pricing
  useEffect(() => {
    if (!eventDetails.venue || !eventDetails.packageType || !eventDetails.eventType) return;

    // Get base price
    let basePrice = 0;
    const isWeekend = ['friday', 'saturday', 'sunday'].includes(eventDetails.dayOfWeek);
    const isSaturday = eventDetails.dayOfWeek === 'saturday';
    
    if (eventDetails.venue === 'diamond') {
      if (eventDetails.packageType === 'gold') {
        basePrice = isSaturday ? 8995 : isWeekend ? 7995 : 6995;
      } else if (eventDetails.packageType === 'platinum') {
        basePrice = isSaturday ? 10995 : isWeekend ? 9995 : 8995;
      } else {
        basePrice = isSaturday ? 11995 : isWeekend ? 10995 : 9995;
      }
    } else {
      basePrice = isSaturday ? 4500 : isWeekend ? 3500 : 2500;
      
      if (eventDetails.packageType === 'platinum') {
        basePrice *= 1.2;
      } else if (eventDetails.packageType === 'diamond') {
        basePrice *= 1.4;
      }
    }
    
    // Apply adjustments
    const season = getSeason(eventDetails.date);
    if (season === 'high') basePrice *= 1.1;
    else if (season === 'low') basePrice *= 0.9;
    
    const eventMultiplier = eventTypes[eventDetails.eventType === 'custom' ? 'custom' : eventDetails.eventType].priceMultiplier;
    if (eventMultiplier > 1.1) basePrice *= 1.1;
    else if (eventMultiplier < 0.9) basePrice *= 0.9;
    
    if (eventDetails.timeSlot === 'morning') basePrice *= 0.9;
    else if (eventDetails.timeSlot === 'night') basePrice *= 1.05;
    
    if (eventDetails.duration > 4) {
      basePrice += (eventDetails.duration - 4) * 800;
    }
    
    const baseGuests = eventDetails.venue === 'diamond' ? 80 : 50;
    if (eventDetails.guestCount > baseGuests) {
      const extraGuests = eventDetails.guestCount - baseGuests;
      const extraGuestFee = season === 'high' ? 80 : season === 'low' ? 45 : 52;
      basePrice += extraGuests * extraGuestFee;
    }

    // Use custom base price if set
    if (customPricing.basePrice !== null) {
      basePrice = customPricing.basePrice;
    }

    // Calculate add-ons
    let addOnsTotal = 0;
    eventDetails.addOns.forEach(addOnId => {
      const addOn = addOnServices.find(a => a.id === addOnId);
      if (addOn) {
        const price = customPricing.addOnPrices[addOnId] || addOn.price;
        if (addOn.perPerson) {
          addOnsTotal += price * eventDetails.guestCount;
        } else {
          addOnsTotal += price;
        }
      }
    });

    // Calculate totals
    const subtotal = basePrice + addOnsTotal;
    const discountAmount = (subtotal * eventDetails.discount) / 100;
    const afterDiscount = subtotal - discountAmount;
    const tax = afterDiscount * (customPricing.tax / 100);
    const serviceFee = afterDiscount * (customPricing.serviceFee / 100);
    const total = afterDiscount + tax + serviceFee;

    setPricing({
      basePrice: Math.round(basePrice),
      addOnsTotal: Math.round(addOnsTotal),
      subtotal: Math.round(subtotal),
      tax: Math.round(tax),
      serviceFee: Math.round(serviceFee),
      discountAmount: Math.round(discountAmount),
      total: Math.round(total)
    });
  }, [eventDetails, customPricing]);

  // Generate Google Calendar event
  const generateGoogleCalendarEvent = () => {
    const eventDate = new Date(eventDetails.date);
    const eventType = eventDetails.eventType === 'custom' ? eventDetails.customEventType : eventTypes[eventDetails.eventType]?.name;
    
    const details = `${eventType} - ${customerInfo.firstName} ${customerInfo.lastName}
Venue: ${venues[eventDetails.venue]?.name}
Package: ${packageInclusions[eventDetails.packageType]?.name}
Guests: ${eventDetails.guestCount}
Total: $${pricing.total.toLocaleString()}`;
    
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventType)}&dates=${eventDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}&details=${encodeURIComponent(details)}`;
    
    window.open(calendarUrl, '_blank');
  };

  // Generate PDF
  const generatePDF = () => {
    if (!validateCustomerInfo()) {
      alert('Please fill in all required customer information');
      return;
    }

    const eventType = eventDetails.eventType === 'custom' ? eventDetails.customEventType : eventTypes[eventDetails.eventType]?.name;
    const timeDescription = eventDetails.timeSlot === 'custom' ? eventDetails.customTime : {
      morning: '6:00 AM - 12:00 PM',
      afternoon: '12:00 PM - 5:00 PM',
      evening: '5:00 PM - 8:00 PM',
      night: '8:00 PM - 1:00 AM'
    }[eventDetails.timeSlot];

    const contractHTML = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
    .header { text-align: center; margin-bottom: 40px; }
    .header h1 { color: #2c3e50; margin: 0; }
    .header p { color: #7f8c8d; margin: 5px 0; }
    .section { margin: 30px 0; }
    .section h2 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background-color: #f8f9fa; font-weight: bold; }
    .total-row { font-weight: bold; font-size: 1.2em; background-color: #f8f9fa; }
    .customer-info { background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0; }
    .terms { margin-top: 40px; padding: 20px; background-color: #f8f9fa; border-radius: 5px; }
    .signature { margin-top: 60px; display: flex; justify-content: space-between; }
    .signature-box { width: 45%; border-top: 2px solid #333; padding-top: 10px; }
    .footer { text-align: center; margin-top: 40px; color: #7f8c8d; font-size: 0.9em; }
  </style>
</head>
<body>
  <div class="header">
    <h1>${venues[eventDetails.venue]?.name} Venue</h1>
    <p>Event Contract & Quote</p>
    <p>Date: ${new Date().toLocaleDateString()}</p>
    <p>Contract #: ${Date.now()}</p>
  </div>

  <div class="customer-info">
    <h2>Customer Information</h2>
    <p><strong>Name:</strong> ${customerInfo.firstName} ${customerInfo.lastName} ${customerInfo.secondLastName}</p>
    <p><strong>Email:</strong> ${customerInfo.email}</p>
    <p><strong>Phone:</strong> ${customerInfo.phone}</p>
    ${customerInfo.address ? `<p><strong>Address:</strong> ${customerInfo.address}, ${customerInfo.city}, ${customerInfo.state} ${customerInfo.zipCode}</p>` : ''}
    ${customerInfo.referralSource ? `<p><strong>How did you hear about us:</strong> ${customerInfo.referralSource}</p>` : ''}
  </div>

  <div class="section">
    <h2>Event Information</h2>
    <table>
      <tr><th>Event Type</th><td>${eventType}</td></tr>
      <tr><th>Event Date</th><td>${new Date(eventDetails.date).toLocaleDateString()} (${eventDetails.dayOfWeek})</td></tr>
      <tr><th>Time</th><td>${timeDescription}</td></tr>
      <tr><th>Duration</th><td>${eventDetails.duration} hours</td></tr>
      <tr><th>Number of Guests</th><td>${eventDetails.guestCount}</td></tr>
      <tr><th>Package</th><td>${packageInclusions[eventDetails.packageType]?.name}</td></tr>
    </table>
  </div>

  <div class="section">
    <h2>Services Included in ${packageInclusions[eventDetails.packageType]?.name} Package</h2>
    <ul>
      <li>Elegant Venue Rental (${eventDetails.duration} Hours)</li>
      <li>Full Setup & Breakdown</li>
      <li>Event Coordinator</li>
      <li>Waiters & Bartender</li>
      <li>Open Bar (House Liquors) ${eventTypes[eventDetails.eventType]?.includesAlcohol ? '' : '- Non-Alcoholic Only'}</li>
      <li>Unlimited Sodas & Water</li>
      <li>Sit Down Dinner: Salad, Main Entrée with 2 sides, Bread & Butter</li>
      <li>Standard Centerpieces</li>
      <li>DJ Service</li>
      <li>Uplighting Throughout Venue</li>
      <li>Standard Stage Decor</li>
      <li>Formal Table Setting</li>
      <li>Custom Buttercream Cake</li>
      ${eventDetails.packageType === 'platinum' || eventDetails.packageType === 'diamond' ? '<li>Cheese Table Display</li>' : ''}
      ${eventDetails.packageType === 'platinum' || eventDetails.packageType === 'diamond' ? '<li>Special Decoration Package</li>' : ''}
      ${eventDetails.packageType === 'diamond' ? '<li>Professional Photo & Video</li>' : ''}
      ${eventDetails.packageType === 'diamond' ? '<li>Champagne Service</li>' : ''}
      ${eventDetails.packageType === 'diamond' ? '<li>Photobooth</li>' : ''}
    </ul>
  </div>

  ${eventDetails.addOns.length > 0 ? `
  <div class="section">
    <h2>Additional Services</h2>
    <table>
      <tr><th>Service</th><th>Unit Price</th><th>Quantity</th><th>Total</th></tr>
      ${eventDetails.addOns.map(addOnId => {
        const addOn = addOnServices.find(a => a.id === addOnId);
        const quantity = addOn.perPerson ? eventDetails.guestCount : 1;
        const price = customPricing.addOnPrices[addOnId] || addOn.price;
        const total = addOn.perPerson ? price * quantity : price;
        return `
          <tr>
            <td>${addOn.name}</td>
            <td>$${price}${addOn.perPerson ? ' per person' : ''}</td>
            <td>${quantity}</td>
            <td>$${total.toLocaleString()}</td>
          </tr>
        `;
      }).join('')}
    </table>
  </div>
  ` : ''}

  <div class="section">
    <h2>Price Breakdown</h2>
    <table>
      <tr><th>Description</th><th>Amount</th></tr>
      <tr><td>Base Package Price</td><td>$${pricing.basePrice.toLocaleString()}</td></tr>
      ${pricing.addOnsTotal > 0 ? `<tr><td>Additional Services</td><td>$${pricing.addOnsTotal.toLocaleString()}</td></tr>` : ''}
      <tr><td>Subtotal</td><td>$${pricing.subtotal.toLocaleString()}</td></tr>
      ${pricing.discountAmount > 0 ? `<tr><td>Discount (${eventDetails.discount}%)</td><td>-$${pricing.discountAmount.toLocaleString()}</td></tr>` : ''}
      <tr><td>Tax (${customPricing.tax}%)</td><td>$${pricing.tax.toLocaleString()}</td></tr>
      <tr><td>Service Fee (${customPricing.serviceFee}%)</td><td>$${pricing.serviceFee.toLocaleString()}</td></tr>
      <tr class="total-row"><td>TOTAL AMOUNT DUE</td><td>$${pricing.total.toLocaleString()}</td></tr>
    </table>
  </div>

  ${customerInfo.notes ? `
  <div class="section">
    <h3>Special Notes</h3>
    <p>${customerInfo.notes}</p>
  </div>
  ` : ''}

  <div class="terms">
    <h3>Terms & Conditions</h3>
    <ol>
      <li>A 50% deposit is required to secure the date.</li>
      <li>Final payment is due 14 days before the event.</li>
      <li>Cancellations must be made at least 30 days in advance for deposit refund.</li>
      <li>Guest count must be finalized 7 days before the event.</li>
      <li>All prices are subject to ${customPricing.tax}% tax and ${customPricing.serviceFee}% service fee.</li>
      <li>Additional hours may be purchased at $800 per hour.</li>
    </ol>
  </div>

  <div class="signature">
    <div class="signature-box">
      <p>${customerInfo.firstName} ${customerInfo.lastName}</p>
      <p>Date: _________________</p>
    </div>
    <div class="signature-box">
      <p>Venue Representative</p>
      <p>Date: _________________</p>
    </div>
  </div>

  <div class="footer">
    <p>${venues[eventDetails.venue]?.name} Venue | Miami, FL | (305) XXX-XXXX</p>
  </div>
</body>
</html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(contractHTML);
    printWindow.document.close();
    printWindow.print();
  };

  // UI Components
  const StepIndicator = ({ currentStep, totalSteps }) => (
    <div className="flex items-center justify-center mb-8">
      {[...Array(totalSteps)].map((_, i) => (
        <React.Fragment key={i}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold
            ${i < currentStep ? 'bg-green-500 text-white' : 
              i === currentStep ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
            {i + 1}
          </div>
          {i < totalSteps - 1 && (
            <div className={`w-20 h-1 ${i < currentStep ? 'bg-green-500' : 'bg-gray-300'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const PriceSummary = () => (
    <div className="bg-blue-50 p-4 rounded-lg mb-4">
      <h4 className="font-semibold mb-2 flex items-center gap-2">
        <DollarSign className="w-5 h-5" />
        Current Total
      </h4>
      <div className="text-2xl font-bold text-blue-600">
        ${pricing.total.toLocaleString()}
      </div>
      {eventDetails.discount > 0 && (
        <div className="text-sm text-green-600 mt-1">
          {eventDetails.discount}% discount applied
        </div>
      )}
    </div>
  );

  const [currentStep, setCurrentStep] = useState(0);

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <User className="w-6 h-6" />
              Customer Information
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">First Name *</label>
                <input
                  type="text"
                  value={customerInfo.firstName}
                  onChange={(e) => setCustomerInfo({...customerInfo, firstName: e.target.value})}
                  className={`w-full p-2 border rounded-lg ${errors.firstName ? 'border-red-500' : ''}`}
                  placeholder="John"
                />
                {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Last Name *</label>
                <input
                  type="text"
                  value={customerInfo.lastName}
                  onChange={(e) => setCustomerInfo({...customerInfo, lastName: e.target.value})}
                  className={`w-full p-2 border rounded-lg ${errors.lastName ? 'border-red-500' : ''}`}
                  placeholder="Doe"
                />
                {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Second Last Name</label>
                <input
                  type="text"
                  value={customerInfo.secondLastName}
                  onChange={(e) => setCustomerInfo({...customerInfo, secondLastName: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                  placeholder="Optional"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  Phone *
                </label>
                <input
                  type="tel"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo({...customerInfo, phone: formatPhone(e.target.value)})}
                  className={`w-full p-2 border rounded-lg ${errors.phone ? 'border-red-500' : ''}`}
                  placeholder="(305) 555-1234"
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>
              
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  Email *
                </label>
                <input
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                  className={`w-full p-2 border rounded-lg ${errors.email ? 'border-red-500' : ''}`}
                  placeholder="john.doe@email.com"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
              
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  Address
                </label>
                <input
                  type="text"
                  value={customerInfo.address}
                  onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                  placeholder="123 Main St"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">City</label>
                <input
                  type="text"
                  value={customerInfo.city}
                  onChange={(e) => setCustomerInfo({...customerInfo, city: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">State</label>
                <input
                  type="text"
                  value={customerInfo.state}
                  onChange={(e) => setCustomerInfo({...customerInfo, state: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                  maxLength="2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">ZIP Code</label>
                <input
                  type="text"
                  value={customerInfo.zipCode}
                  onChange={(e) => setCustomerInfo({...customerInfo, zipCode: e.target.value.replace(/\D/g, '')})}
                  className="w-full p-2 border rounded-lg"
                  maxLength="5"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">How did you hear about us?</label>
                <select
                  value={customerInfo.referralSource}
                  onChange={(e) => setCustomerInfo({...customerInfo, referralSource: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="">Select...</option>
                  <option value="google">Google</option>
                  <option value="facebook">Facebook</option>
                  <option value="instagram">Instagram</option>
                  <option value="friend">Friend/Family</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Special Notes</label>
                <textarea
                  value={customerInfo.notes}
                  onChange={(e) => setCustomerInfo({...customerInfo, notes: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                  rows="3"
                  placeholder="Any special requests or notes..."
                />
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            {pricing.total > 0 && <PriceSummary />}
            
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Package className="w-6 h-6" />
              Select Venue & Package
            </h3>
            
            <div>
              <label className="block text-sm font-medium mb-2">Venue</label>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(venues).map(([key, venue]) => (
                  <button
                    key={key}
                    onClick={() => setEventDetails({...eventDetails, venue: key})}
                    className={`p-4 rounded-lg border-2 transition-all
                      ${eventDetails.venue === key ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}>
                    <h4 className="font-bold">{venue.name}</h4>
                    <p className="text-xs text-gray-600">{venue.locations.join(', ')}</p>
                    <p className="text-sm text-gray-600">Up to {venue.capacity} guests</p>
                    <p className="text-sm font-semibold">From ${venue.minPrice.toLocaleString()}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Package Type</label>
              <div className="space-y-2">
                {Object.entries(packageInclusions).map(([key, pkg]) => (
                  <button
                    key={key}
                    onClick={() => setEventDetails({...eventDetails, packageType: key, addOns: []})}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all
                      ${eventDetails.packageType === key ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}>
                    <div className="font-semibold text-lg">{pkg.name} Package</div>
                    <div className="text-sm text-gray-600 mt-1">
                      {key === 'gold' && 'Essential services for your event'}
                      {key === 'platinum' && 'Enhanced package with cheese table & special decoration'}
                      {key === 'diamond' && 'Complete package with photo/video, champagne & photobooth'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            {pricing.total > 0 && <PriceSummary />}
            
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Star className="w-6 h-6" />
              Event Details
            </h3>
            
            <div>
              <label className="block text-sm font-medium mb-2">Event Type</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(eventTypes).filter(([key]) => key !== 'custom').map(([key, type]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setEventDetails({...eventDetails, eventType: key});
                      setShowCustomEvent(false);
                    }}
                    className={`p-3 rounded-lg border-2 text-sm transition-all
                      ${eventDetails.eventType === key ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}>
                    {type.name}
                  </button>
                ))}
                <button
                  onClick={() => {
                    setEventDetails({...eventDetails, eventType: 'custom'});
                    setShowCustomEvent(true);
                  }}
                  className={`p-3 rounded-lg border-2 text-sm transition-all flex items-center justify-center gap-2
                    ${eventDetails.eventType === 'custom' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}>
                  <Plus className="w-4 h-4" />
                  Other Event
                </button>
              </div>
              
              {showCustomEvent && (
                <input
                  type="text"
                  placeholder="Enter event type"
                  value={eventDetails.customEventType}
                  onChange={(e) => setEventDetails({...eventDetails, customEventType: e.target.value})}
                  className="w-full mt-2 p-2 border rounded-lg"
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Number of Guests
              </label>
              <input
                type="number"
                value={eventDetails.guestCount}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  if (value >= 0 && value <= 300) {
                    setEventDetails({...eventDetails, guestCount: value});
                  }
                }}
                className="w-full p-2 border rounded-lg"
                min="1"
                max="300"
              />
              {eventDetails.venue && eventDetails.guestCount > venues[eventDetails.venue].capacity && (
                <p className="text-sm text-orange-600 mt-1">
                  Additional fees apply for guests over {venues[eventDetails.venue].capacity}
                </p>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            {pricing.total > 0 && <PriceSummary />}
            
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Calendar className="w-6 h-6" />
              Date & Time
            </h3>
            
            <div>
              <label className="block text-sm font-medium mb-2">Event Date</label>
              <input
                type="date"
                value={eventDetails.date}
                onChange={(e) => {
                  const date = new Date(e.target.value);
                  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                  setEventDetails({
                    ...eventDetails, 
                    date: e.target.value,
                    dayOfWeek: days[date.getDay()]
                  });
                }}
                className="w-full p-2 border rounded-lg"
                min={new Date().toISOString().split('T')[0]}
              />
              {eventDetails.date && (
                <p className="text-sm text-gray-600 mt-1">
                  Season: {getSeason(eventDetails.date).charAt(0).toUpperCase() + getSeason(eventDetails.date).slice(1)}
                  {eventDetails.dayOfWeek === 'saturday' && ' | Premium Saturday pricing applies'}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Time Slot
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setEventDetails({...eventDetails, timeSlot: 'morning'});
                    setShowCustomTime(false);
                  }}
                  className={`p-3 rounded-lg border-2 transition-all
                    ${eventDetails.timeSlot === 'morning' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}>
                  <div className="font-semibold">Morning</div>
                  <div className="text-xs text-gray-600">6AM - 12PM</div>
                </button>
                <button
                  onClick={() => {
                    setEventDetails({...eventDetails, timeSlot: 'afternoon'});
                    setShowCustomTime(false);
                  }}
                  className={`p-3 rounded-lg border-2 transition-all
                    ${eventDetails.timeSlot === 'afternoon' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}>
                  <div className="font-semibold">Afternoon</div>
                  <div className="text-xs text-gray-600">12PM - 5PM</div>
                </button>
                <button
                  onClick={() => {
                    setEventDetails({...eventDetails, timeSlot: 'evening'});
                    setShowCustomTime(false);
                  }}
                  className={`p-3 rounded-lg border-2 transition-all
                    ${eventDetails.timeSlot === 'evening' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}>
                  <div className="font-semibold">Evening</div>
                  <div className="text-xs text-gray-600">5PM - 8PM</div>
                </button>
                <button
                  onClick={() => {
                    setEventDetails({...eventDetails, timeSlot: 'night'});
                    setShowCustomTime(false);
                  }}
                  className={`p-3 rounded-lg border-2 transition-all
                    ${eventDetails.timeSlot === 'night' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}>
                  <div className="font-semibold">Night</div>
                  <div className="text-xs text-gray-600">8PM - 1AM</div>
                </button>
              </div>
              
              <button
                onClick={() => {
                  setEventDetails({...eventDetails, timeSlot: 'custom'});
                  setShowCustomTime(true);
                }}
                className={`w-full mt-2 p-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2
                  ${eventDetails.timeSlot === 'custom' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}>
                <Plus className="w-4 h-4" />
                Custom Time
              </button>
              
              {showCustomTime && (
                <input
                  type="text"
                  placeholder="Enter custom time (e.g., 3PM - 7PM)"
                  value={eventDetails.customTime}
                  onChange={(e) => setEventDetails({...eventDetails, customTime: e.target.value})}
                  className="w-full mt-2 p-2 border rounded-lg"
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Duration (hours)</label>
              <input
                type="number"
                value={eventDetails.duration}
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 0;
                  if (value >= 3 && value <= 12) {
                    setEventDetails({...eventDetails, duration: value});
                  }
                }}
                className="w-full p-2 border rounded-lg"
                min="3"
                max="12"
                step="0.5"
              />
              <p className="text-sm text-gray-600 mt-1">
                Minimum: 3 hours | Additional hours: $800/hour
              </p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            {pricing.total > 0 && <PriceSummary />}
            
            <h3 className="text-xl font-bold">Add-On Services</h3>
            
            {eventDetails.packageType && (
              <div className="bg-blue-50 p-3 rounded-lg text-sm">
                <p className="font-semibold">Your {packageInclusions[eventDetails.packageType].name} package includes:</p>
                {eventDetails.packageType === 'platinum' && 'Cheese Table & Special Decoration'}
                {eventDetails.packageType === 'diamond' && 'Cheese Table, Special Decoration, Photo/Video, Champagne & Photobooth'}
              </div>
            )}
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {getAvailableAddOns().map(addOn => (
                <label key={addOn.id} className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={eventDetails.addOns.includes(addOn.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setEventDetails({...eventDetails, addOns: [...eventDetails.addOns, addOn.id]});
                      } else {
                        setEventDetails({...eventDetails, addOns: eventDetails.addOns.filter(id => id !== addOn.id)});
                      }
                    }}
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <div className="font-medium">{addOn.name}</div>
                    <div className="text-sm text-gray-600">
                      ${customPricing.addOnPrices[addOn.id] || addOn.price}{addOn.perPerson && ' per person'}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {editMode.addOns[addOn.id] ? (
                      <>
                        <input
                          type="number"
                          value={customPricing.addOnPrices[addOn.id] || addOn.price}
                          onChange={(e) => setCustomPricing({
                            ...customPricing,
                            addOnPrices: {...customPricing.addOnPrices, [addOn.id]: parseFloat(e.target.value) || 0}
                          })}
                          className="w-20 p-1 border rounded"
                          step="0.01"
                        />
                        <button
                          onClick={() => setEditMode({...editMode, addOns: {...editMode.addOns, [addOn.id]: false}})}
                          className="text-green-500"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="font-semibold">
                          ${addOn.perPerson ? ((customPricing.addOnPrices[addOn.id] || addOn.price) * eventDetails.guestCount).toFixed(2) : (customPricing.addOnPrices[addOn.id] || addOn.price)}
                        </span>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            setEditMode({...editMode, addOns: {...editMode.addOns, [addOn.id]: true}});
                          }}
                          className="text-blue-500"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </label>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <Percent className="w-4 h-4" />
                Discount (%)
              </label>
              <input
                type="number"
                value={eventDetails.discount}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  if (value >= 0 && value <= 50) {
                    setEventDetails({...eventDetails, discount: value});
                  }
                }}
                className="w-full p-2 border rounded-lg"
                min="0"
                max="50"
              />
              {eventDetails.discount > 0 && (
                <p className="text-sm text-green-600 mt-1">
                  Discount amount: ${pricing.discountAmount.toLocaleString()}
                </p>
              )}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <DollarSign className="w-6 h-6" />
              Price Summary & Review
            </h3>
            
            <div className="bg-gray-50 p-6 rounded-lg space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>Base Package Price</span>
                  <div className="flex items-center gap-2">
                    {editMode.basePrice ? (
                      <>
                        <input
                          type="number"
                          value={customPricing.basePrice || pricing.basePrice}
                          onChange={(e) => setCustomPricing({...customPricing, basePrice: parseFloat(e.target.value) || 0})}
                          className="w-28 p-1 border rounded"
                        />
                        <button
                          onClick={() => setEditMode({...editMode, basePrice: false})}
                          className="text-green-500"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="font-medium">${pricing.basePrice.toLocaleString()}</span>
                        <button
                          onClick={() => setEditMode({...editMode, basePrice: true})}
                          className="text-blue-500"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                
                {pricing.addOnsTotal > 0 && (
                  <div className="flex justify-between text-gray-700">
                    <span>Add-On Services</span>
                    <span className="font-medium">${pricing.addOnsTotal.toLocaleString()}</span>
                  </div>
                )}
                
                <div className="flex justify-between font-semibold pt-2 border-t">
                  <span>Subtotal</span>
                  <span>${pricing.subtotal.toLocaleString()}</span>
                </div>
                
                {pricing.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({eventDetails.discount}%)</span>
                    <span>-${pricing.discountAmount.toLocaleString()}</span>
                  </div>
                )}
                
                <div className="flex justify-between items-center text-gray-700">
                  <span>Tax</span>
                  <div className="flex items-center gap-2">
                    {editMode.tax ? (
                      <>
                        <input
                          type="number"
                          value={customPricing.tax}
                          onChange={(e) => setCustomPricing({...customPricing, tax: parseFloat(e.target.value) || 0})}
                          className="w-16 p-1 border rounded"
                          step="0.1"
                        />
                        <span>%</span>
                        <button
                          onClick={() => setEditMode({...editMode, tax: false})}
                          className="text-green-500"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <span>${pricing.tax.toLocaleString()} ({customPricing.tax}%)</span>
                        <button
                          onClick={() => setEditMode({...editMode, tax: true})}
                          className="text-blue-500"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-between items-center text-gray-700">
                  <span>Service Fee</span>
                  <div className="flex items-center gap-2">
                    {editMode.serviceFee ? (
                      <>
                        <input
                          type="number"
                          value={customPricing.serviceFee}
                          onChange={(e) => setCustomPricing({...customPricing, serviceFee: parseFloat(e.target.value) || 0})}
                          className="w-16 p-1 border rounded"
                          step="0.1"
                        />
                        <span>%</span>
                        <button
                          onClick={() => setEditMode({...editMode, serviceFee: false})}
                          className="text-green-500"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <span>${pricing.serviceFee.toLocaleString()} ({customPricing.serviceFee}%)</span>
                        <button
                          onClick={() => setEditMode({...editMode, serviceFee: true})}
                          className="text-blue-500"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-between text-2xl font-bold pt-2 border-t">
                  <span>Total</span>
                  <span className="text-blue-600">${pricing.total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Event Summary
              </h4>
              <div className="text-sm space-y-1">
                <p><strong>Customer:</strong> {customerInfo.firstName} {customerInfo.lastName}</p>
                <p><strong>Venue:</strong> {venues[eventDetails.venue]?.name}</p>
                <p><strong>Package:</strong> {packageInclusions[eventDetails.packageType]?.name}</p>
                <p><strong>Event Type:</strong> {eventDetails.eventType === 'custom' ? eventDetails.customEventType : eventTypes[eventDetails.eventType]?.name}</p>
                <p><strong>Date:</strong> {eventDetails.date ? new Date(eventDetails.date).toLocaleDateString() : ''} ({eventDetails.dayOfWeek})</p>
                <p><strong>Time:</strong> {eventDetails.timeSlot === 'custom' ? eventDetails.customTime : eventDetails.timeSlot}</p>
                <p><strong>Duration:</strong> {eventDetails.duration} hours</p>
                <p><strong>Guests:</strong> {eventDetails.guestCount}</p>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={generatePDF}
                className="flex-1 bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center justify-center gap-2">
                <FileText className="w-5 h-5" />
                Generate Contract PDF
              </button>
              
              <button
                onClick={generateGoogleCalendarEvent}
                className="flex-1 bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2">
                <Calendar className="w-5 h-5" />
                Add to Google Calendar
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    if (currentStep === 0) {
      return validateCustomerInfo();
    }
    if (currentStep === 1) {
      return eventDetails.venue && eventDetails.packageType;
    }
    if (currentStep === 2) {
      return eventDetails.eventType && (eventDetails.eventType !== 'custom' || eventDetails.customEventType);
    }
    if (currentStep === 3) {
      return eventDetails.date && eventDetails.timeSlot && (eventDetails.timeSlot !== 'custom' || eventDetails.customTime);
    }
    return true;
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-2">Diamond Venue Doral</h1>
        <h2 className="text-xl text-gray-600 text-center mb-8">Event Pricing Calculator</h2>
        
        <StepIndicator currentStep={currentStep} totalSteps={6} />
        
        <div className="mb-8">
          {renderStep()}
        </div>
        
        <div className="flex justify-between">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className={`px-6 py-2 rounded-lg font-medium transition-colors
              ${currentStep === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 
                'bg-gray-500 text-white hover:bg-gray-600'}`}>
            Previous
          </button>
          
          <button
            onClick={() => {
              if (canProceed()) {
                setCurrentStep(Math.min(5, currentStep + 1));
              } else if (currentStep === 0) {
                validateCustomerInfo();
              }
            }}
            disabled={currentStep === 5}
            className={`px-6 py-2 rounded-lg font-medium transition-colors
              ${currentStep === 5 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 
                'bg-blue-500 text-white hover:bg-blue-600'}`}>
            {currentStep === 4 ? 'Review & Finalize' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VenuePricingCalculator;