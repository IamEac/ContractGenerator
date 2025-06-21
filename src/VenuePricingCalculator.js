import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, DollarSign, Percent, Star, Package, AlertCircle, FileText, Plus, Download, Calculator, Check, X } from 'lucide-react';

const VenuePricingCalculator = () => {
  // State management
  const [eventDetails, setEventDetails] = useState({
    // Customer Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    celebrantName: '',
    // Event Details
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
    discount: 0,
    specialRequests: ''
  });

  const [showCustomEvent, setShowCustomEvent] = useState(false);
  const [showCustomTime, setShowCustomTime] = useState(false);
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

  // Package definitions with included services
  const packages = {
    gold: { 
      name: 'Gold (Basic)', 
      multiplier: 1.0,
      includes: ['venue', 'setup', 'coordinator', 'staff', 'basicBar', 'dinner', 'centerpieces', 'uplighting']
    },
    platinum: { 
      name: 'Platinum (Premium)', 
      multiplier: 1.15,
      includes: ['venue', 'setup', 'coordinator', 'staff', 'basicBar', 'dinner', 'centerpieces', 'uplighting', 
                'dj', 'cake', 'decoration', 'photobooth']
    },
    diamond: { 
      name: 'Diamond (Deluxe)', 
      multiplier: 1.3,
      includes: ['venue', 'setup', 'coordinator', 'staff', 'premiumBar', 'dinner', 'centerpieces', 'uplighting',
                'dj', 'cake', 'decoration', 'photobooth', 'photoVideo', 'cheeseTable', 'champagne', 'limousine']
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

  // All available add-on services
  const allAddOnServices = [
    { id: 'crazyHour', name: 'Crazy Hour', price: 450, category: 'entertainment' },
    { id: 'premiumAlcohol', name: 'Premium Alcohol', price: 18, perPerson: true, category: 'bar', includedIn: ['diamond'] },
    { id: 'extraHour', name: 'Extra Hour', price: 800, category: 'time' },
    { id: 'photoVideo', name: 'Photo and Video', price: 1000, category: 'media', includedIn: ['diamond'] },
    { id: 'photobooth', name: 'Photobooth', price: 450, category: 'media', includedIn: ['platinum', 'diamond'] },
    { id: 'appetizers', name: 'Appetizers', price: 6, perPerson: true, category: 'food' },
    { id: 'limousine', name: 'Limousine', price: 250, category: 'transport', includedIn: ['diamond'] },
    { id: 'decoration', name: 'Special Decoration', price: 380, category: 'decor', includedIn: ['platinum', 'diamond'] },
    { id: 'champagne', name: 'Champagne', price: 6, perPerson: true, category: 'bar', includedIn: ['diamond'] },
    { id: 'cheeseTable', name: 'Cheese Table', price: 3.8, perPerson: true, category: 'food', includedIn: ['diamond'] },
    { id: 'cake', name: 'Custom Cake', price: 150, category: 'food', includedIn: ['platinum', 'diamond'] },
    { id: 'dj', name: 'DJ (5 hours)', price: 350, category: 'entertainment', includedIn: ['platinum', 'diamond'] },
    { id: 'miniDesserts', name: 'Mini Desserts (min 36)', price: 108, category: 'food' },
    { id: 'masterCeremonies', name: 'Master of Ceremonies', price: 250, category: 'entertainment' },
    { id: 'animation', name: 'Animation', price: 250, category: 'entertainment' }
  ];

  // Get available add-ons based on selected package
  const getAvailableAddOns = () => {
    if (!eventDetails.packageType) return allAddOnServices;
    
    return allAddOnServices.filter(service => {
      // If service is included in selected package, don't show as add-on
      if (service.includedIn && service.includedIn.includes(eventDetails.packageType)) {
        return false;
      }
      return true;
    });
  };

  // Get included services for display
  const getIncludedServices = () => {
    if (!eventDetails.packageType) return [];
    
    return allAddOnServices.filter(service => {
      return service.includedIn && service.includedIn.includes(eventDetails.packageType);
    });
  };

  // Validation functions
  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone) => {
    return /^[\d\s\-\(\)]+$/.test(phone) && phone.replace(/\D/g, '').length >= 10;
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    switch(step) {
      case 0: // Customer info
        if (!eventDetails.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!eventDetails.lastName.trim()) newErrors.lastName = 'Last name is required';
        if (!eventDetails.email.trim()) newErrors.email = 'Email is required';
        else if (!validateEmail(eventDetails.email)) newErrors.email = 'Invalid email format';
        if (!eventDetails.phone.trim()) newErrors.phone = 'Phone is required';
        else if (!validatePhone(eventDetails.phone)) newErrors.phone = 'Invalid phone format';
        break;
      case 1: // Venue & Package
        if (!eventDetails.venue) newErrors.venue = 'Please select a venue';
        if (!eventDetails.packageType) newErrors.packageType = 'Please select a package';
        break;
      case 2: // Event details
        if (!eventDetails.eventType) newErrors.eventType = 'Please select event type';
        if (eventDetails.eventType === 'custom' && !eventDetails.customEventType.trim()) {
          newErrors.customEventType = 'Please specify event type';
        }
        if (!eventDetails.guestCount || eventDetails.guestCount < 1) {
          newErrors.guestCount = 'Invalid guest count';
        }
        break;
      case 3: // Date & Time
        if (!eventDetails.date) newErrors.date = 'Please select a date';
        if (!eventDetails.timeSlot) newErrors.timeSlot = 'Please select a time';
        if (eventDetails.timeSlot === 'custom' && !eventDetails.customTime.trim()) {
          newErrors.customTime = 'Please specify time';
        }
        if (!eventDetails.duration || eventDetails.duration < 3) {
          newErrors.duration = 'Minimum duration is 3 hours';
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

  const getDayMultiplier = (day) => {
    const multipliers = {
      saturday: 1.15,
      friday: 1.08,
      sunday: 0.95,
      thursday: 0.9,
      wednesday: 0.9,
      tuesday: 0.9,
      monday: 0.85
    };
    return multipliers[day] || 1;
  };

  const getTimeMultiplier = (time) => {
    const multipliers = {
      morning: 0.8,
      afternoon: 0.95,
      evening: 1.1,
      night: 1.15,
      custom: 1.0
    };
    return multipliers[time] || 1;
  };

  // Calculate pricing
  useEffect(() => {
    if (!eventDetails.venue || !eventDetails.packageType || !eventDetails.eventType) {
      setPricing({
        basePrice: 0,
        addOnsTotal: 0,
        subtotal: 0,
        tax: 0,
        serviceFee: 0,
        discountAmount: 0,
        total: 0
      });
      return;
    }

    try {
      // Get base price from actual pricing tables
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
      
      // Seasonal adjustment
      const season = getSeason(eventDetails.date);
      if (season === 'high') {
        basePrice *= 1.1;
      } else if (season === 'low') {
        basePrice *= 0.9;
      }
      
      // Event type adjustment
      const eventMultiplier = eventTypes[eventDetails.eventType === 'custom' ? 'custom' : eventDetails.eventType].priceMultiplier;
      if (eventMultiplier > 1.1) {
        basePrice *= 1.1;
      } else if (eventMultiplier < 0.9) {
        basePrice *= 0.9;
      }
      
      // Time slot adjustment
      if (eventDetails.timeSlot === 'morning') {
        basePrice *= 0.9;
      } else if (eventDetails.timeSlot === 'night') {
        basePrice *= 1.05;
      }
      
      // Duration adjustment
      if (eventDetails.duration > 4) {
        basePrice += (eventDetails.duration - 4) * 800;
      }
      
      // Guest count adjustment
      const baseGuests = eventDetails.venue === 'diamond' ? 80 : 50;
      const guestCount = parseInt(eventDetails.guestCount) || 0;
      if (guestCount > baseGuests) {
        const extraGuests = guestCount - baseGuests;
        const extraGuestFee = season === 'high' ? 80 : season === 'low' ? 45 : 52;
        basePrice += extraGuests * extraGuestFee;
      }

      // Calculate add-ons
      let addOnsTotal = 0;
      const availableAddOns = getAvailableAddOns();
      
      eventDetails.addOns.forEach(addOnId => {
        const addOn = availableAddOns.find(a => a.id === addOnId);
        if (addOn) {
          if (addOn.perPerson) {
            addOnsTotal += Math.round(addOn.price * guestCount);
          } else {
            addOnsTotal += addOn.price;
          }
        }
      });

      // Calculate totals
      const subtotal = Math.round(basePrice + addOnsTotal);
      const discountAmount = Math.round((subtotal * eventDetails.discount) / 100);
      const afterDiscount = subtotal - discountAmount;
      const tax = Math.round(afterDiscount * 0.07);
      const serviceFee = Math.round(afterDiscount * 0.18);
      const total = afterDiscount + tax + serviceFee;

      setPricing({
        basePrice: Math.round(basePrice),
        addOnsTotal: Math.round(addOnsTotal),
        subtotal,
        tax,
        serviceFee,
        discountAmount,
        total
      });
    } catch (error) {
      console.error('Pricing calculation error:', error);
    }
  }, [eventDetails]);

  // Alternative download method for contract
  const downloadContract = () => {
    try {
      const eventType = eventDetails.eventType === 'custom' ? eventDetails.customEventType : eventTypes[eventDetails.eventType]?.name;
      const timeDescription = eventDetails.timeSlot === 'custom' ? eventDetails.customTime : {
        morning: '6:00 AM - 12:00 PM',
        afternoon: '12:00 PM - 5:00 PM',
        evening: '5:00 PM - 8:00 PM',
        night: '8:00 PM - 1:00 AM'
      }[eventDetails.timeSlot];

      const includedServices = getIncludedServices();
      const selectedAddOns = getAvailableAddOns().filter(addon => eventDetails.addOns.includes(addon.id));

      const contractHTML = `
<!DOCTYPE html>
<html>
<head>
  <title>Event Contract - ${eventDetails.firstName} ${eventDetails.lastName}</title>
  <style>
    @media print {
      body { margin: 0; }
      @page { margin: 0.5in; }
      .no-print { display: none; }
    }
    body { 
      font-family: Arial, sans-serif; 
      line-height: 1.6;
      color: #333;
      padding: 20px;
    }
    .contract-wrapper {
      max-width: 800px;
      margin: 0 auto;
    }
    .header { 
      text-align: center; 
      margin-bottom: 40px;
      border-bottom: 3px solid #2c3e50;
      padding-bottom: 20px;
    }
    .header h1 { 
      color: #2c3e50; 
      margin: 0;
      font-size: 32px;
    }
    .header p { 
      color: #7f8c8d; 
      margin: 5px 0;
      font-size: 14px;
    }
    .contract-number {
      text-align: right;
      color: #666;
      margin-bottom: 20px;
    }
    .section { 
      margin: 30px 0;
      page-break-inside: avoid;
    }
    .section h2 { 
      color: #2c3e50; 
      border-bottom: 2px solid #3498db; 
      padding-bottom: 10px;
      margin-bottom: 20px;
    }
    table { 
      width: 100%; 
      border-collapse: collapse; 
      margin: 20px 0;
    }
    th, td { 
      padding: 12px; 
      text-align: left; 
      border-bottom: 1px solid #ddd;
    }
    th { 
      background-color: #f8f9fa; 
      font-weight: bold;
      color: #2c3e50;
    }
    .services-table td:last-child,
    .services-table th:last-child {
      text-align: right;
    }
    .total-section {
      margin-top: 20px;
      border-top: 2px solid #333;
      padding-top: 20px;
    }
    .total-row { 
      font-weight: bold; 
      font-size: 1.2em;
      background-color: #f8f9fa;
    }
    .discount-row {
      color: #27ae60;
      font-weight: bold;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }
    .info-box {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 5px;
    }
    .info-box h3 {
      margin: 0 0 10px 0;
      color: #2c3e50;
    }
    .info-box p {
      margin: 5px 0;
    }
    ul {
      columns: 2;
      column-gap: 40px;
    }
    li {
      margin-bottom: 5px;
    }
    .included-service {
      color: #27ae60;
      font-weight: bold;
    }
    .pricing-details {
      background: #f0f8ff;
      padding: 20px;
      border-radius: 5px;
      margin: 20px 0;
    }
    .pricing-details h3 {
      color: #2c3e50;
      margin-bottom: 15px;
    }
    .pricing-details p {
      margin: 8px 0;
      font-size: 14px;
    }
    .terms { 
      margin-top: 40px; 
      padding: 20px; 
      background-color: #f8f9fa; 
      border-radius: 5px;
      page-break-inside: avoid;
    }
    .terms h3 {
      color: #2c3e50;
      margin-bottom: 15px;
    }
    .terms ol {
      padding-left: 20px;
    }
    .terms li {
      margin-bottom: 10px;
    }
    .signature-section { 
      margin-top: 60px;
      page-break-inside: avoid;
    }
    .signature-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      margin-top: 40px;
    }
    .signature-box { 
      text-align: center;
    }
    .signature-line {
      border-bottom: 2px solid #333;
      margin: 40px 0 10px 0;
    }
    .footer { 
      text-align: center; 
      margin-top: 60px; 
      padding-top: 20px;
      border-top: 1px solid #ddd;
      color: #7f8c8d; 
      font-size: 12px;
    }
    .important-note {
      background: #fff3cd;
      border: 1px solid #ffc107;
      padding: 15px;
      border-radius: 5px;
      margin: 20px 0;
    }
    .no-print {
      margin: 20px 0;
      text-align: center;
      background: #f0f0f0;
      padding: 20px;
      border-radius: 5px;
    }
  </style>
</head>
<body>
  <div class="no-print">
    <h2>Event Contract Ready</h2>
    <p>Use Ctrl+P (or Cmd+P on Mac) to print this contract or save as PDF</p>
    <button onclick="window.print()" style="padding: 10px 20px; font-size: 16px; background: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer;">
      Print Contract
    </button>
  </div>

  <div class="contract-wrapper">
    <div class="header">
      <h1>${venues[eventDetails.venue]?.name} Venue</h1>
      <p>Event Services Contract</p>
      <p>${venues[eventDetails.venue]?.locations.join(' | ')}</p>
    </div>

    <div class="contract-number">
      <strong>Contract #:</strong> ${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}<br>
      <strong>Date:</strong> ${new Date().toLocaleDateString()}<br>
      <strong>Sales Representative:</strong> _________________
    </div>

    <div class="section">
      <h2>Client Information</h2>
      <div class="info-grid">
        <div class="info-box">
          <h3>Contact Details</h3>
          <p><strong>Name:</strong> ${eventDetails.firstName} ${eventDetails.lastName}</p>
          <p><strong>Email:</strong> ${eventDetails.email}</p>
          <p><strong>Phone:</strong> ${eventDetails.phone}</p>
          ${eventDetails.address ? `<p><strong>Address:</strong> ${eventDetails.address}</p>` : ''}
        </div>
        <div class="info-box">
          <h3>Event Information</h3>
          <p><strong>Event Type:</strong> ${eventType}</p>
          ${eventDetails.celebrantName ? `<p><strong>Celebrant:</strong> ${eventDetails.celebrantName}</p>` : ''}
          <p><strong>Guest Count:</strong> ${eventDetails.guestCount}</p>
          <p><strong>Package:</strong> ${packages[eventDetails.packageType]?.name}</p>
        </div>
      </div>
    </div>

    <div class="section">
      <h2>Event Details</h2>
      <table>
        <tr>
          <th style="width: 30%">Item</th>
          <th style="width: 70%">Description</th>
        </tr>
        <tr>
          <td><strong>Venue</strong></td>
          <td>${venues[eventDetails.venue]?.name} - ${venues[eventDetails.venue]?.locations[0]}</td>
        </tr>
        <tr>
          <td><strong>Package</strong></td>
          <td>${packages[eventDetails.packageType]?.name}</td>
        </tr>
        <tr>
          <td><strong>Date</strong></td>
          <td>${new Date(eventDetails.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
        </tr>
        <tr>
          <td><strong>Time</strong></td>
          <td>${timeDescription}</td>
        </tr>
        <tr>
          <td><strong>Duration</strong></td>
          <td>${eventDetails.duration} hours</td>
        </tr>
        <tr>
          <td><strong>Season</strong></td>
          <td>${getSeason(eventDetails.date).charAt(0).toUpperCase() + getSeason(eventDetails.date).slice(1)} Season</td>
        </tr>
      </table>
    </div>

    <div class="pricing-details">
      <h3>Pricing Calculation Details</h3>
      <p><strong>Base Package Price:</strong> ${pricing.basePrice.toLocaleString()}</p>
      <p><strong>Day of Week:</strong> ${eventDetails.dayOfWeek} (${getDayMultiplier(eventDetails.dayOfWeek) > 1 ? '+' : ''}${Math.round((getDayMultiplier(eventDetails.dayOfWeek) - 1) * 100)}%)</p>
      <p><strong>Season:</strong> ${getSeason(eventDetails.date)} (${getSeason(eventDetails.date) === 'high' ? '+10%' : getSeason(eventDetails.date) === 'low' ? '-10%' : '0%'})</p>
      <p><strong>Time Slot:</strong> ${eventDetails.timeSlot} (${getTimeMultiplier(eventDetails.timeSlot) > 1 ? '+' : ''}${Math.round((getTimeMultiplier(eventDetails.timeSlot) - 1) * 100)}%)</p>
      ${eventDetails.guestCount > venues[eventDetails.venue].capacity ? `<p><strong>Extra Guests:</strong> ${eventDetails.guestCount - venues[eventDetails.venue].capacity} guests × ${getSeason(eventDetails.date) === 'high' ? '80' : getSeason(eventDetails.date) === 'low' ? '45' : '52'}/guest</p>` : ''}
      ${eventDetails.duration > 4 ? `<p><strong>Extra Hours:</strong> ${eventDetails.duration - 4} hours × $800/hour = ${(eventDetails.duration - 4) * 800}</p>` : ''}
    </div>

    <div class="section">
      <h2>Services Included in ${packages[eventDetails.packageType]?.name} Package</h2>
      <ul>
        <li>Elegant Venue Rental (${eventDetails.duration} Hours)</li>
        <li>Professional Event Coordinator</li>
        <li>Full Setup & Breakdown Service</li>
        <li>Experienced Wait Staff & Bartender</li>
        <li>Open Bar (House Liquors)${eventDetails.eventType && eventTypes[eventDetails.eventType]?.includesAlcohol === false ? ' - Non-Alcoholic Only' : ''}</li>
        <li>Unlimited Sodas & Water</li>
        <li>Sit-Down Dinner Service</li>
        <li>Choice of Salad (Caesar or Garden)</li>
        <li>Choice of Main Entrée</li>
        <li>Two Side Dishes</li>
        <li>Fresh Bread & Butter</li>
        <li>Standard Centerpieces</li>
        <li>LED Uplighting Throughout Venue</li>
        <li>Formal Table Settings</li>
        ${includedServices.map(service => `<li class="included-service">✓ ${service.name} (Included)</li>`).join('')}
      </ul>
    </div>

    ${selectedAddOns.length > 0 ? `
    <div class="section">
      <h2>Additional Services</h2>
      <table class="services-table">
        <tr>
          <th style="width: 40%">Service</th>
          <th style="width: 20%">Unit Price</th>
          <th style="width: 20%">Quantity</th>
          <th style="width: 20%">Total</th>
        </tr>
        ${selectedAddOns.map(addOn => {
          const quantity = addOn.perPerson ? eventDetails.guestCount : 1;
          const unitPrice = addOn.price;
          const total = unitPrice * quantity;
          return `
            <tr>
              <td>${addOn.name}</td>
              <td>${unitPrice.toFixed(2)}${addOn.perPerson ? '/person' : ''}</td>
              <td>${quantity}</td>
              <td>${total.toFixed(2)}</td>
            </tr>
          `;
        }).join('')}
      </table>
    </div>
    ` : ''}

    <div class="section">
      <h2>Price Summary</h2>
      <table>
        <tr>
          <td style="width: 70%">Base Package Price (${packages[eventDetails.packageType]?.name})</td>
          <td style="text-align: right; width: 30%">${pricing.basePrice.toLocaleString()}.00</td>
        </tr>
        ${pricing.addOnsTotal > 0 ? `
        <tr>
          <td>Additional Services</td>
          <td style="text-align: right">${pricing.addOnsTotal.toLocaleString()}.00</td>
        </tr>
        ` : ''}
        <tr>
          <td><strong>Subtotal</strong></td>
          <td style="text-align: right"><strong>${pricing.subtotal.toLocaleString()}.00</strong></td>
        </tr>
        ${pricing.discountAmount > 0 ? `
        <tr class="discount-row">
          <td>Discount (${eventDetails.discount}%)</td>
          <td style="text-align: right">-${pricing.discountAmount.toLocaleString()}.00</td>
        </tr>
        <tr>
          <td><strong>Subtotal After Discount</strong></td>
          <td style="text-align: right"><strong>${(pricing.subtotal - pricing.discountAmount).toLocaleString()}.00</strong></td>
        </tr>
        ` : ''}
        <tr>
          <td>Sales Tax (7%)</td>
          <td style="text-align: right">${pricing.tax.toLocaleString()}.00</td>
        </tr>
        <tr>
          <td>Service Fee (18%)</td>
          <td style="text-align: right">${pricing.serviceFee.toLocaleString()}.00</td>
        </tr>
        <tr class="total-row">
          <td style="font-size: 1.2em; padding: 15px">TOTAL AMOUNT DUE</td>
          <td style="text-align: right; font-size: 1.2em; padding: 15px">${pricing.total.toLocaleString()}.00</td>
        </tr>
      </table>
    </div>

    ${eventDetails.specialRequests ? `
    <div class="section">
      <h2>Special Requests</h2>
      <div class="important-note">
        <p>${eventDetails.specialRequests}</p>
      </div>
    </div>
    ` : ''}

    <div class="terms">
      <h3>Terms & Conditions</h3>
      <ol>
        <li><strong>Deposit:</strong> A non-refundable deposit of 50% is required to secure your event date. The deposit amount of <strong>${Math.round(pricing.total * 0.5).toLocaleString()}.00</strong> is due upon contract signing.</li>
        <li><strong>Final Payment:</strong> The remaining balance of <strong>${Math.round(pricing.total * 0.5).toLocaleString()}.00</strong> is due 14 days prior to the event date.</li>
        <li><strong>Guest Count:</strong> Final guest count must be confirmed 7 days before the event. Additional guests may be added at ${eventDetails.venue === 'diamond' ? '52-80' : '45-52'} per person.</li>
        <li><strong>Cancellation Policy:</strong> Cancellations made less than 30 days before the event forfeit the deposit. Cancellations within 14 days forfeit the full payment.</li>
        <li><strong>Time Extension:</strong> Additional hours may be purchased at $800 per hour, subject to availability.</li>
        <li><strong>Damages:</strong> Client is responsible for any damages to the venue or equipment caused by guests.</li>
        <li><strong>Service Standards:</strong> All prices include 7% sales tax and 18% service fee as required by law.</li>
        <li><strong>Menu Selection:</strong> Final menu selections must be submitted 14 days prior to the event.</li>
        <li><strong>Outside Vendors:</strong> No outside catering or beverages permitted. Outside vendors for other services must be pre-approved.</li>
        <li><strong>Force Majeure:</strong> Neither party shall be liable for failure to perform due to causes beyond their reasonable control.</li>
      </ol>
    </div>

    <div class="signature-section">
      <p style="margin-bottom: 40px;">By signing below, both parties agree to the terms and conditions outlined in this contract.</p>
      
      <div class="signature-grid">
        <div class="signature-box">
          <div class="signature-line"></div>
          <p><strong>${eventDetails.firstName} ${eventDetails.lastName}</strong><br>Client Signature<br>Date: _____________</p>
        </div>
        <div class="signature-box">
          <div class="signature-line"></div>
          <p><strong>Venue Representative</strong><br>${venues[eventDetails.venue]?.name} Venue<br>Date: _____________</p>
        </div>
      </div>
    </div>

    <div class="footer">
      <p><strong>${venues[eventDetails.venue]?.name} Venue</strong></p>
      <p>Miami, FL | (305) 555-0123 | events@${eventDetails.venue}venue.com</p>
      <p>www.${eventDetails.venue}venue.com</p>
      <p style="margin-top: 10px; font-size: 10px;">This contract is valid for 30 days from the date of issue. Prices subject to change after expiration.</p>
    </div>
  </div>
</body>
</html>`;

      // Create blob and download
      const blob = new Blob([contractHTML], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Contract_${eventDetails.firstName}_${eventDetails.lastName}_${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      alert('Contract downloaded! Open the file and print it or save as PDF using Ctrl+P (Cmd+P on Mac).');
      
    } catch (error) {
      console.error('Download error:', error);
      alert('There was an error downloading the contract. Please try again.');
    }
  };

  // Generate PDF
  const generatePDF = () => {
    try {
      const eventType = eventDetails.eventType === 'custom' ? eventDetails.customEventType : eventTypes[eventDetails.eventType]?.name;
      const timeDescription = eventDetails.timeSlot === 'custom' ? eventDetails.customTime : {
        morning: '6:00 AM - 12:00 PM',
        afternoon: '12:00 PM - 5:00 PM',
        evening: '5:00 PM - 8:00 PM',
        night: '8:00 PM - 1:00 AM'
      }[eventDetails.timeSlot];

      const includedServices = getIncludedServices();
      const selectedAddOns = getAvailableAddOns().filter(addon => eventDetails.addOns.includes(addon.id));

      // Create a new window with specific dimensions
      const printWindow = window.open('', 'PRINT', 'height=800,width=1000');
      
      if (!printWindow) {
        alert('Please allow pop-ups for this website to generate the contract PDF.');
        return;
      }
    
    const contractHTML = `
<!DOCTYPE html>
<html>
<head>
  <title>Event Contract - ${eventDetails.firstName} ${eventDetails.lastName}</title>
  <style>
    @media print {
      body { margin: 0; }
      @page { margin: 0.5in; }
    }
    body { 
      font-family: Arial, sans-serif; 
      line-height: 1.6;
      color: #333;
      padding: 20px;
    }
    .contract-wrapper {
      max-width: 800px;
      margin: 0 auto;
    }
    .header { 
      text-align: center; 
      margin-bottom: 40px;
      border-bottom: 3px solid #2c3e50;
      padding-bottom: 20px;
    }
    .header h1 { 
      color: #2c3e50; 
      margin: 0;
      font-size: 32px;
    }
    .header p { 
      color: #7f8c8d; 
      margin: 5px 0;
      font-size: 14px;
    }
    .contract-number {
      text-align: right;
      color: #666;
      margin-bottom: 20px;
    }
    .section { 
      margin: 30px 0;
      page-break-inside: avoid;
    }
    .section h2 { 
      color: #2c3e50; 
      border-bottom: 2px solid #3498db; 
      padding-bottom: 10px;
      margin-bottom: 20px;
    }
    table { 
      width: 100%; 
      border-collapse: collapse; 
      margin: 20px 0;
    }
    th, td { 
      padding: 12px; 
      text-align: left; 
      border-bottom: 1px solid #ddd;
    }
    th { 
      background-color: #f8f9fa; 
      font-weight: bold;
      color: #2c3e50;
    }
    .services-table td:last-child,
    .services-table th:last-child {
      text-align: right;
    }
    .total-section {
      margin-top: 20px;
      border-top: 2px solid #333;
      padding-top: 20px;
    }
    .total-row { 
      font-weight: bold; 
      font-size: 1.2em;
      background-color: #f8f9fa;
    }
    .discount-row {
      color: #27ae60;
      font-weight: bold;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }
    .info-box {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 5px;
    }
    .info-box h3 {
      margin: 0 0 10px 0;
      color: #2c3e50;
    }
    .info-box p {
      margin: 5px 0;
    }
    ul {
      columns: 2;
      column-gap: 40px;
    }
    li {
      margin-bottom: 5px;
    }
    .included-service {
      color: #27ae60;
      font-weight: bold;
    }
    .pricing-details {
      background: #f0f8ff;
      padding: 20px;
      border-radius: 5px;
      margin: 20px 0;
    }
    .pricing-details h3 {
      color: #2c3e50;
      margin-bottom: 15px;
    }
    .pricing-details p {
      margin: 8px 0;
      font-size: 14px;
    }
    .terms { 
      margin-top: 40px; 
      padding: 20px; 
      background-color: #f8f9fa; 
      border-radius: 5px;
      page-break-inside: avoid;
    }
    .terms h3 {
      color: #2c3e50;
      margin-bottom: 15px;
    }
    .terms ol {
      padding-left: 20px;
    }
    .terms li {
      margin-bottom: 10px;
    }
    .signature-section { 
      margin-top: 60px;
      page-break-inside: avoid;
    }
    .signature-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      margin-top: 40px;
    }
    .signature-box { 
      text-align: center;
    }
    .signature-line {
      border-bottom: 2px solid #333;
      margin: 40px 0 10px 0;
    }
    .footer { 
      text-align: center; 
      margin-top: 60px; 
      padding-top: 20px;
      border-top: 1px solid #ddd;
      color: #7f8c8d; 
      font-size: 12px;
    }
    .important-note {
      background: #fff3cd;
      border: 1px solid #ffc107;
      padding: 15px;
      border-radius: 5px;
      margin: 20px 0;
    }
    .no-print {
      margin: 20px 0;
      text-align: center;
    }
    @media print {
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="no-print">
    <button onclick="window.print()" style="padding: 10px 20px; font-size: 16px; background: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer;">
      Download PDF
    </button>
    <button onclick="window.close()" style="padding: 10px 20px; font-size: 16px; background: #e74c3c; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">
      Close
    </button>
  </div>

  <div class="contract-wrapper">
    <div class="header">
      <h1>${venues[eventDetails.venue]?.name} Venue</h1>
      <p>Event Services Contract</p>
      <p>${venues[eventDetails.venue]?.locations.join(' | ')}</p>
    </div>

    <div class="contract-number">
      <strong>Contract #:</strong> ${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}<br>
      <strong>Date:</strong> ${new Date().toLocaleDateString()}<br>
      <strong>Sales Representative:</strong> _________________
    </div>

    <div class="section">
      <h2>Client Information</h2>
      <div class="info-grid">
        <div class="info-box">
          <h3>Contact Details</h3>
          <p><strong>Name:</strong> ${eventDetails.firstName} ${eventDetails.lastName}</p>
          <p><strong>Email:</strong> ${eventDetails.email}</p>
          <p><strong>Phone:</strong> ${eventDetails.phone}</p>
          ${eventDetails.address ? `<p><strong>Address:</strong> ${eventDetails.address}</p>` : ''}
        </div>
        <div class="info-box">
          <h3>Event Information</h3>
          <p><strong>Event Type:</strong> ${eventType}</p>
          ${eventDetails.celebrantName ? `<p><strong>Celebrant:</strong> ${eventDetails.celebrantName}</p>` : ''}
          <p><strong>Guest Count:</strong> ${eventDetails.guestCount}</p>
          <p><strong>Package:</strong> ${packages[eventDetails.packageType]?.name}</p>
        </div>
      </div>
    </div>

    <div class="section">
      <h2>Event Details</h2>
      <table>
        <tr>
          <th style="width: 30%">Item</th>
          <th style="width: 70%">Description</th>
        </tr>
        <tr>
          <td><strong>Venue</strong></td>
          <td>${venues[eventDetails.venue]?.name} - ${venues[eventDetails.venue]?.locations[0]}</td>
        </tr>
        <tr>
          <td><strong>Package</strong></td>
          <td>${packages[eventDetails.packageType]?.name}</td>
        </tr>
        <tr>
          <td><strong>Date</strong></td>
          <td>${new Date(eventDetails.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
        </tr>
        <tr>
          <td><strong>Time</strong></td>
          <td>${timeDescription}</td>
        </tr>
        <tr>
          <td><strong>Duration</strong></td>
          <td>${eventDetails.duration} hours</td>
        </tr>
        <tr>
          <td><strong>Season</strong></td>
          <td>${getSeason(eventDetails.date).charAt(0).toUpperCase() + getSeason(eventDetails.date).slice(1)} Season</td>
        </tr>
      </table>
    </div>

    <div class="pricing-details">
      <h3>Pricing Calculation Details</h3>
      <p><strong>Base Package Price:</strong> $${pricing.basePrice.toLocaleString()}</p>
      <p><strong>Day of Week:</strong> ${eventDetails.dayOfWeek} (${getDayMultiplier(eventDetails.dayOfWeek) > 1 ? '+' : ''}${Math.round((getDayMultiplier(eventDetails.dayOfWeek) - 1) * 100)}%)</p>
      <p><strong>Season:</strong> ${getSeason(eventDetails.date)} (${getSeason(eventDetails.date) === 'high' ? '+10%' : getSeason(eventDetails.date) === 'low' ? '-10%' : '0%'})</p>
      <p><strong>Time Slot:</strong> ${eventDetails.timeSlot} (${getTimeMultiplier(eventDetails.timeSlot) > 1 ? '+' : ''}${Math.round((getTimeMultiplier(eventDetails.timeSlot) - 1) * 100)}%)</p>
      ${eventDetails.guestCount > (venues[eventDetails.venue]?.capacity || 0) ? `<p><strong>Extra Guests:</strong> ${eventDetails.guestCount - (venues[eventDetails.venue]?.capacity || 0)} guests × ${getSeason(eventDetails.date) === 'high' ? '80' : getSeason(eventDetails.date) === 'low' ? '45' : '52'}/guest</p>` : ''}
      ${eventDetails.duration > 4 ? `<p><strong>Extra Hours:</strong> ${eventDetails.duration - 4} hours × $800/hour = $${(eventDetails.duration - 4) * 800}</p>` : ''}
    </div>

    <div class="section">
      <h2>Services Included in ${packages[eventDetails.packageType]?.name} Package</h2>
      <ul>
        <li>Elegant Venue Rental (${eventDetails.duration} Hours)</li>
        <li>Professional Event Coordinator</li>
        <li>Full Setup & Breakdown Service</li>
        <li>Experienced Wait Staff & Bartender</li>
        <li>Open Bar (House Liquors)${eventDetails.eventType && eventTypes[eventDetails.eventType]?.includesAlcohol === false ? ' - Non-Alcoholic Only' : ''}</li>
        <li>Unlimited Sodas & Water</li>
        <li>Sit-Down Dinner Service</li>
        <li>Choice of Salad (Caesar or Garden)</li>
        <li>Choice of Main Entrée</li>
        <li>Two Side Dishes</li>
        <li>Fresh Bread & Butter</li>
        <li>Standard Centerpieces</li>
        <li>LED Uplighting Throughout Venue</li>
        <li>Formal Table Settings</li>
        ${includedServices.map(service => `<li class="included-service">✓ ${service.name} (Included)</li>`).join('')}
      </ul>
    </div>

    ${selectedAddOns.length > 0 ? `
    <div class="section">
      <h2>Additional Services</h2>
      <table class="services-table">
        <tr>
          <th style="width: 40%">Service</th>
          <th style="width: 20%">Unit Price</th>
          <th style="width: 20%">Quantity</th>
          <th style="width: 20%">Total</th>
        </tr>
        ${selectedAddOns.map(addOn => {
          const quantity = addOn.perPerson ? eventDetails.guestCount : 1;
          const unitPrice = addOn.price;
          const total = unitPrice * quantity;
          return `
            <tr>
              <td>${addOn.name}</td>
              <td>$${unitPrice.toFixed(2)}${addOn.perPerson ? '/person' : ''}</td>
              <td>${quantity}</td>
              <td>$${total.toFixed(2)}</td>
            </tr>
          `;
        }).join('')}
      </table>
    </div>
    ` : ''}

    <div class="section">
      <h2>Price Summary</h2>
      <table>
        <tr>
          <td style="width: 70%">Base Package Price (${packages[eventDetails.packageType]?.name})</td>
          <td style="text-align: right; width: 30%">$${pricing.basePrice.toLocaleString()}.00</td>
        </tr>
        ${pricing.addOnsTotal > 0 ? `
        <tr>
          <td>Additional Services</td>
          <td style="text-align: right">$${pricing.addOnsTotal.toLocaleString()}.00</td>
        </tr>
        ` : ''}
        <tr>
          <td><strong>Subtotal</strong></td>
          <td style="text-align: right"><strong>$${pricing.subtotal.toLocaleString()}.00</strong></td>
        </tr>
        ${pricing.discountAmount > 0 ? `
        <tr class="discount-row">
          <td>Discount (${eventDetails.discount}%)</td>
          <td style="text-align: right">-$${pricing.discountAmount.toLocaleString()}.00</td>
        </tr>
        <tr>
          <td><strong>Subtotal After Discount</strong></td>
          <td style="text-align: right"><strong>$${(pricing.subtotal - pricing.discountAmount).toLocaleString()}.00</strong></td>
        </tr>
        ` : ''}
        <tr>
          <td>Sales Tax (7%)</td>
          <td style="text-align: right">$${pricing.tax.toLocaleString()}.00</td>
        </tr>
        <tr>
          <td>Service Fee (18%)</td>
          <td style="text-align: right">$${pricing.serviceFee.toLocaleString()}.00</td>
        </tr>
        <tr class="total-row">
          <td style="font-size: 1.2em; padding: 15px">TOTAL AMOUNT DUE</td>
          <td style="text-align: right; font-size: 1.2em; padding: 15px">$${pricing.total.toLocaleString()}.00</td>
        </tr>
      </table>
    </div>

    ${eventDetails.specialRequests ? `
    <div class="section">
      <h2>Special Requests</h2>
      <div class="important-note">
        <p>${eventDetails.specialRequests}</p>
      </div>
    </div>
    ` : ''}

    <div class="terms">
      <h3>Terms & Conditions</h3>
      <ol>
        <li><strong>Deposit:</strong> A non-refundable deposit of 50% is required to secure your event date. The deposit amount of <strong>$${Math.round(pricing.total * 0.5).toLocaleString()}.00</strong> is due upon contract signing.</li>
        <li><strong>Final Payment:</strong> The remaining balance of <strong>$${Math.round(pricing.total * 0.5).toLocaleString()}.00</strong> is due 14 days prior to the event date.</li>
        <li><strong>Guest Count:</strong> Final guest count must be confirmed 7 days before the event. Additional guests may be added at $${eventDetails.venue === 'diamond' ? '52-80' : '45-52'} per person.</li>
        <li><strong>Cancellation Policy:</strong> Cancellations made less than 30 days before the event forfeit the deposit. Cancellations within 14 days forfeit the full payment.</li>
        <li><strong>Time Extension:</strong> Additional hours may be purchased at $800 per hour, subject to availability.</li>
        <li><strong>Damages:</strong> Client is responsible for any damages to the venue or equipment caused by guests.</li>
        <li><strong>Service Standards:</strong> All prices include 7% sales tax and 18% service fee as required by law.</li>
        <li><strong>Menu Selection:</strong> Final menu selections must be submitted 14 days prior to the event.</li>
        <li><strong>Outside Vendors:</strong> No outside catering or beverages permitted. Outside vendors for other services must be pre-approved.</li>
        <li><strong>Force Majeure:</strong> Neither party shall be liable for failure to perform due to causes beyond their reasonable control.</li>
      </ol>
    </div>

    <div class="signature-section">
      <p style="margin-bottom: 40px;">By signing below, both parties agree to the terms and conditions outlined in this contract.</p>
      
      <div class="signature-grid">
        <div class="signature-box">
          <div class="signature-line"></div>
          <p><strong>${eventDetails.firstName} ${eventDetails.lastName}</strong><br>Client Signature<br>Date: _____________</p>
        </div>
        <div class="signature-box">
          <div class="signature-line"></div>
          <p><strong>Venue Representative</strong><br>${venues[eventDetails.venue]?.name} Venue<br>Date: _____________</p>
        </div>
      </div>
    </div>

    <div class="footer">
      <p><strong>${venues[eventDetails.venue]?.name} Venue</strong></p>
      <p>Miami, FL | (305) 555-0123 | events@${eventDetails.venue}venue.com</p>
      <p>www.${eventDetails.venue}venue.com</p>
      <p style="margin-top: 10px; font-size: 10px;">This contract is valid for 30 days from the date of issue. Prices subject to change after expiration.</p>
    </div>
  </div>
</body>
</html>
    `;

    printWindow.document.write(contractHTML);
    printWindow.document.close();
    
    // Focus the window and trigger print after a short delay
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
    
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('There was an error generating the PDF. Please try again.');
    }
  };

  // UI Components
  const PriceDisplay = () => (
    <div className="fixed top-4 right-4 bg-white p-4 rounded-lg shadow-lg border-2 border-blue-500 z-50">
      <h3 className="text-sm font-bold text-gray-600 mb-2">Current Quote</h3>
      <div className="text-2xl font-bold text-blue-600">
        ${pricing.total.toLocaleString()}
      </div>
      {pricing.discountAmount > 0 && (
        <div className="text-sm text-green-600 mt-1">
          Discount: ${pricing.discountAmount.toLocaleString()} ({eventDetails.discount}%)
        </div>
      )}
      <div className="text-xs text-gray-500 mt-1">
        Includes tax & fees
      </div>
    </div>
  );

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

  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(Math.min(5, currentStep + 1));
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Users className="w-6 h-6" />
              Customer Information
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">First Name *</label>
                <input
                  type="text"
                  value={eventDetails.firstName}
                  onChange={(e) => setEventDetails({...eventDetails, firstName: e.target.value})}
                  className={`w-full p-2 border rounded-lg ${errors.firstName ? 'border-red-500' : ''}`}
                  required
                />
                {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Last Name *</label>
                <input
                  type="text"
                  value={eventDetails.lastName}
                  onChange={(e) => setEventDetails({...eventDetails, lastName: e.target.value})}
                  className={`w-full p-2 border rounded-lg ${errors.lastName ? 'border-red-500' : ''}`}
                  required
                />
                {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email Address *</label>
              <input
                type="email"
                value={eventDetails.email}
                onChange={(e) => setEventDetails({...eventDetails, email: e.target.value})}
                className={`w-full p-2 border rounded-lg ${errors.email ? 'border-red-500' : ''}`}
                required
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Phone Number *</label>
              <input
                type="tel"
                value={eventDetails.phone}
                onChange={(e) => setEventDetails({...eventDetails, phone: e.target.value})}
                className={`w-full p-2 border rounded-lg ${errors.phone ? 'border-red-500' : ''}`}
                placeholder="(305) 555-0123"
                required
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Address</label>
              <input
                type="text"
                value={eventDetails.address}
                onChange={(e) => setEventDetails({...eventDetails, address: e.target.value})}
                className="w-full p-2 border rounded-lg"
                placeholder="Street Address, City, State ZIP"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Celebrant Name (if different from customer)</label>
              <input
                type="text"
                value={eventDetails.celebrantName}
                onChange={(e) => setEventDetails({...eventDetails, celebrantName: e.target.value})}
                className="w-full p-2 border rounded-lg"
                placeholder="e.g., Name of birthday person, quinceañera, bride & groom"
              />
            </div>
          </div>
        );
        
      case 1:
        return (
          <div className="space-y-6">
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
              {errors.venue && <p className="text-red-500 text-xs mt-1">{errors.venue}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Package Type</label>
              <div className="space-y-2">
                {Object.entries(packages).map(([key, pkg]) => (
                  <button
                    key={key}
                    onClick={() => setEventDetails({...eventDetails, packageType: key})}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all
                      ${eventDetails.packageType === key ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-semibold">{pkg.name}</span>
                        <div className="text-xs text-gray-600 mt-1">
                          {key === 'gold' && 'Basic package with essential services'}
                          {key === 'platinum' && 'Premium package with DJ, cake, decoration'}
                          {key === 'diamond' && 'All-inclusive luxury package'}
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">+{Math.round((pkg.multiplier - 1) * 100)}%</span>
                    </div>
                  </button>
                ))}
              </div>
              {errors.packageType && <p className="text-red-500 text-xs mt-1">{errors.packageType}</p>}
            </div>

            {eventDetails.packageType && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Included in {packages[eventDetails.packageType].name}:</h4>
                <div className="text-sm text-gray-700">
                  {getIncludedServices().length > 0 ? (
                    <ul className="list-disc list-inside">
                      {getIncludedServices().map(service => (
                        <li key={service.id}>{service.name}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>Standard venue services only</p>
                  )}
                </div>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
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
                    <div>{type.name}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {type.includesAlcohol ? 'Includes alcohol' : 'No alcohol'}
                    </div>
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
              {errors.eventType && <p className="text-red-500 text-xs mt-1">{errors.eventType}</p>}
              
              {showCustomEvent && (
                <>
                  <input
                    type="text"
                    placeholder="Enter event type"
                    value={eventDetails.customEventType}
                    onChange={(e) => setEventDetails({...eventDetails, customEventType: e.target.value})}
                    className={`w-full mt-2 p-2 border rounded-lg ${errors.customEventType ? 'border-red-500' : ''}`}
                  />
                  {errors.customEventType && <p className="text-red-500 text-xs mt-1">{errors.customEventType}</p>}
                </>
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
                  if (value >= 0 && value <= 500) {
                    setEventDetails({...eventDetails, guestCount: value});
                  }
                }}
                className={`w-full p-2 border rounded-lg ${errors.guestCount ? 'border-red-500' : ''}`}
                min="1"
                max="500"
              />
              {errors.guestCount && <p className="text-red-500 text-xs mt-1">{errors.guestCount}</p>}
              {eventDetails.venue && eventDetails.guestCount > venues[eventDetails.venue].capacity && (
                <p className="text-sm text-orange-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  Additional fees apply for guests over {venues[eventDetails.venue].capacity}
                </p>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
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
                className={`w-full p-2 border rounded-lg ${errors.date ? 'border-red-500' : ''}`}
                min={new Date().toISOString().split('T')[0]}
              />
              {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
              {eventDetails.date && (
                <div className="flex gap-4 mt-2 text-sm">
                  <span className="text-gray-600">
                    Season: <span className="font-semibold">{getSeason(eventDetails.date).charAt(0).toUpperCase() + getSeason(eventDetails.date).slice(1)}</span>
                  </span>
                  <span className="text-gray-600">
                    Day: <span className="font-semibold">{eventDetails.dayOfWeek}</span>
                  </span>
                </div>
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
                  <div className="text-xs text-green-600">-20%</div>
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
                  <div className="text-xs text-green-600">-5%</div>
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
                  <div className="text-xs text-orange-600">+10%</div>
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
                  <div className="text-xs text-orange-600">+15%</div>
                </button>
              </div>
              {errors.timeSlot && <p className="text-red-500 text-xs mt-1">{errors.timeSlot}</p>}
              
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
                <>
                  <input
                    type="text"
                    placeholder="Enter custom time (e.g., 3PM - 7PM)"
                    value={eventDetails.customTime}
                    onChange={(e) => setEventDetails({...eventDetails, customTime: e.target.value})}
                    className={`w-full mt-2 p-2 border rounded-lg ${errors.customTime ? 'border-red-500' : ''}`}
                  />
                  {errors.customTime && <p className="text-red-500 text-xs mt-1">{errors.customTime}</p>}
                </>
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
                className={`w-full p-2 border rounded-lg ${errors.duration ? 'border-red-500' : ''}`}
                min="3"
                max="12"
                step="0.5"
              />
              {errors.duration && <p className="text-red-500 text-xs mt-1">{errors.duration}</p>}
              <p className="text-sm text-gray-600 mt-1">
                Minimum: 3 hours | Additional hours: $800/hour
              </p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold">Add-On Services</h3>
            
            <div className="bg-amber-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-amber-800">
                <strong>Note:</strong> Services already included in your {packages[eventDetails.packageType]?.name} package are not shown below.
              </p>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {getAvailableAddOns().map(addOn => {
                const quantity = addOn.perPerson ? eventDetails.guestCount : 1;
                const unitPrice = addOn.price;
                const totalPrice = quantity * unitPrice;
                
                return (
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
                        ${unitPrice.toFixed(2)}{addOn.perPerson && ' per person'} 
                        {addOn.perPerson && ` × ${quantity} guests`}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        ${totalPrice.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {addOn.category}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <Percent className="w-4 h-4" />
                Apply Discount
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  value={eventDetails.discount}
                  onChange={(e) => setEventDetails({...eventDetails, discount: parseInt(e.target.value) || 0})}
                  className="flex-1"
                  min="0"
                  max="50"
                  step="5"
                />
                <input
                  type="number"
                  value={eventDetails.discount}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    if (value >= 0 && value <= 50) {
                      setEventDetails({...eventDetails, discount: value});
                    }
                  }}
                  className="w-20 p-2 border rounded-lg text-center"
                  min="0"
                  max="50"
                />
                <span className="font-semibold">%</span>
              </div>
              {eventDetails.discount > 0 && (
                <div className="mt-2 text-green-600 font-semibold">
                  Discount Amount: ${pricing.discountAmount.toLocaleString()}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Special Requests or Notes</label>
              <textarea
                value={eventDetails.specialRequests}
                onChange={(e) => setEventDetails({...eventDetails, specialRequests: e.target.value})}
                className="w-full p-2 border rounded-lg"
                rows="3"
                placeholder="Any special requirements, dietary restrictions, or additional notes..."
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <DollarSign className="w-6 h-6" />
              Final Price Summary
            </h3>
            
            <div className="bg-gray-50 p-6 rounded-lg space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-gray-700">
                  <span>Base Package Price ({packages[eventDetails.packageType]?.name})</span>
                  <span className="font-medium">${pricing.basePrice.toLocaleString()}</span>
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
                  <>
                    <div className="flex justify-between text-green-600 font-semibold">
                      <span>Discount ({eventDetails.discount}%)</span>
                      <span>-${pricing.discountAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span>After Discount</span>
                      <span>${(pricing.subtotal - pricing.discountAmount).toLocaleString()}</span>
                    </div>
                  </>
                )}
                
                <div className="flex justify-between text-gray-700">
                  <span>Tax (7%)</span>
                  <span>${pricing.tax.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between text-gray-700">
                  <span>Service Fee (18%)</span>
                  <span>${pricing.serviceFee.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between text-2xl font-bold pt-2 border-t bg-blue-50 p-3 rounded">
                  <span>Total</span>
                  <span className="text-blue-600">${pricing.total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">50% Deposit</h4>
                <p className="text-2xl font-bold text-green-600">${Math.round(pricing.total * 0.5).toLocaleString()}</p>
                <p className="text-sm text-gray-600 mt-1">Due at signing</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Final Payment</h4>
                <p className="text-2xl font-bold text-blue-600">${Math.round(pricing.total * 0.5).toLocaleString()}</p>
                <p className="text-sm text-gray-600 mt-1">Due 14 days before event</p>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Event Summary
              </h4>
              <div className="text-sm space-y-1">
                <p><strong>Client:</strong> {eventDetails.firstName} {eventDetails.lastName}</p>
                <p><strong>Venue:</strong> {venues[eventDetails.venue]?.name}</p>
                <p><strong>Package:</strong> {packages[eventDetails.packageType]?.name}</p>
                <p><strong>Event Type:</strong> {eventDetails.eventType === 'custom' ? eventDetails.customEventType : eventTypes[eventDetails.eventType]?.name}</p>
                <p><strong>Date:</strong> {eventDetails.date ? new Date(eventDetails.date).toLocaleDateString() : ''} ({eventDetails.dayOfWeek})</p>
                <p><strong>Time:</strong> {eventDetails.timeSlot === 'custom' ? eventDetails.customTime : eventDetails.timeSlot}</p>
                <p><strong>Duration:</strong> {eventDetails.duration} hours</p>
                <p><strong>Guests:</strong> {eventDetails.guestCount}</p>
                <p><strong>Services:</strong> {getIncludedServices().length + eventDetails.addOns.length} total</p>
              </div>
            </div>

            <button
              onClick={generatePDF}
              disabled={!eventDetails.firstName || !eventDetails.lastName || !eventDetails.email || !eventDetails.phone || !eventDetails.date}
              className={`w-full py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2
                ${!eventDetails.firstName || !eventDetails.lastName || !eventDetails.email || !eventDetails.phone || !eventDetails.date
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-green-500 text-white hover:bg-green-600'}`}>
              <FileText className="w-5 h-5" />
              Generate Contract PDF
            </button>
            
            <button
              onClick={downloadContract}
              disabled={!eventDetails.firstName || !eventDetails.lastName || !eventDetails.email || !eventDetails.phone || !eventDetails.date}
              className={`w-full py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 mt-2
                ${!eventDetails.firstName || !eventDetails.lastName || !eventDetails.email || !eventDetails.phone || !eventDetails.date
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-blue-500 text-white hover:bg-blue-600'}`}>
              <Download className="w-5 h-5" />
              Download Contract (Alternative)
            </button>
            
            <div className="text-center mt-2">
              <p className="text-xs text-gray-500">
                If the PDF doesn't open, use the alternative download button
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {pricing.total > 0 && <PriceDisplay />}
      
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Sales Quote Generator</h1>
          <p className="text-gray-600 mt-2">Diamond Venue Doral - Professional Event Services</p>
        </div>
        
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
            onClick={handleNext}
            disabled={currentStep === 5}
            className={`px-6 py-2 rounded-lg font-medium transition-colors
              ${currentStep === 5 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 
                'bg-blue-500 text-white hover:bg-blue-600'}`}>
            {currentStep === 4 ? 'Review Quote' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VenuePricingCalculator;