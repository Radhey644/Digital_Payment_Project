const Event = require('./models/Event');
const mongoose = require('mongoose');
const path = require('path');
// Load env from project root first, then fallback to local backend .env
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
require('dotenv').config();

// Sample events data
const sampleEvents = [
  {
    eventId: 1,
    name: 'Coldplay Live Concert',
    description: 'Experience the magic of Coldplay live in concert with all their greatest hits!',
    date: '2025-12-15',
    time: '19:00',
    venue: 'JLN Stadium, Delhi',
    price: '0.00',
    totalTickets: 1000,
    availableTickets: 1000,
    category: 'Concert',
    image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=500',
    organizer: 'Live Nation'
  },
  {
    eventId: 2,
    name: 'IPL Final Match',
    description: 'Witness the biggest cricket showdown of the year!',
    date: '2025-11-30',
    time: '15:00',
    venue: 'Wankhede Stadium, Mumbai',
    price: '0.00',
    totalTickets: 800,
    availableTickets: 800,
    category: 'Sports',
    image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=500',
    organizer: 'BCCI'
  },
  {
    eventId: 3,
    name: 'Tech Summit 2025',
    description: 'Join industry leaders for insights into the future of technology',
    date: '2025-12-01',
    time: '09:00',
    venue: 'Bangalore International Convention Centre',
    price: '0.00',
    totalTickets: 500,
    availableTickets: 500,
    category: 'Conference',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500',
    organizer: 'Tech Events India'
  },
  {
    eventId: 4,
    name: 'Arijit Singh Live',
    description: 'An unforgettable evening with the voice of Bollywood',
    date: '2025-12-20',
    time: '18:30',
    venue: 'Thyagaraj Stadium, Delhi',
    price: '0.00',
    totalTickets: 1200,
    availableTickets: 1200,
    category: 'Concert',
    image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=500',
    organizer: 'BookMyShow Live'
  },
  {
    eventId: 5,
    name: 'Shakespeare Festival',
    description: 'Classic theatrical performances by renowned artists',
    date: '2025-11-28',
    time: '19:30',
    venue: 'National Centre for Performing Arts, Mumbai',
    price: '0.00',
    totalTickets: 300,
    availableTickets: 300,
    category: 'Theater',
    image: 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=500',
    organizer: 'Mumbai Theatre Society'
  },
  {
    eventId: 6,
    name: 'EDM Festival 2025',
    description: 'Dance to the beats of international DJs at the biggest EDM festival',
    date: '2025-12-25',
    time: '20:00',
    venue: 'DLF CyberHub, Gurgaon',
    price: '0.00',
    totalTickets: 2000,
    availableTickets: 2000,
    category: 'Concert',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500',
    organizer: 'Sunburn Events'
  },
  {
    eventId: 7,
    name: 'Comedy Night with Kapil Sharma',
    description: 'Laugh your heart out with India\'s favorite comedian',
    date: '2025-12-10',
    time: '20:00',
    venue: 'NSCI Dome, Mumbai',
    price: '0.00',
    totalTickets: 1500,
    availableTickets: 1500,
    category: 'Theater',
    image: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=500',
    organizer: 'Paytm Insider'
  },
  {
    eventId: 8,
    name: 'Indian Premier League Opening Ceremony',
    description: 'Spectacular opening ceremony with star performances',
    date: '2025-12-05',
    time: '18:00',
    venue: 'Eden Gardens, Kolkata',
    price: '0.00',
    totalTickets: 900,
    availableTickets: 900,
    category: 'Sports',
    image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=500',
    organizer: 'IPL Events'
  },
  {
    eventId: 9,
    name: 'Art & Wine Evening',
    description: 'An elegant evening of contemporary art exhibition with wine tasting',
    date: '2025-11-29',
    time: '17:00',
    venue: 'India Habitat Centre, Delhi',
    price: '0.00',
    totalTickets: 200,
    availableTickets: 200,
    category: 'Other',
    image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=500',
    organizer: 'Art Gallery Delhi'
  },
  {
    eventId: 10,
    name: 'Blockchain & Web3 Conference',
    description: 'Explore the future of decentralized technology with industry experts',
    date: '2025-12-08',
    time: '10:00',
    venue: 'Hyderabad International Convention Centre',
    price: '0.00',
    totalTickets: 600,
    availableTickets: 600,
    category: 'Conference',
    image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=500',
    organizer: 'Web3 India'
  },
  {
    eventId: 11,
    name: 'Diwali Food Festival',
    description: 'Celebrate Diwali with authentic Indian cuisine from across the country',
    date: '2025-11-27',
    time: '12:00',
    venue: 'Pragati Maidan, Delhi',
    price: '0.00',
    totalTickets: 1000,
    availableTickets: 1000,
    category: 'Other',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500',
    organizer: 'Delhi Tourism'
  },
  {
    eventId: 12,
    name: 'Yoga & Wellness Retreat',
    description: 'Rejuvenate your mind and body with expert yoga sessions',
    date: '2025-12-18',
    time: '06:00',
    venue: 'Rishikesh Yoga Center',
    price: '0.00',
    totalTickets: 150,
    availableTickets: 150,
    category: 'Other',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500',
    organizer: 'Himalayan Wellness'
  }
];

// Connect to MongoDB and seed data
async function seedDatabase() {
  try {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ticketnft';
    
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Clear existing events
    console.log('🗑️  Clearing existing events...');
    await Event.deleteMany({});
    console.log('✅ Existing events cleared');
    
    // Insert sample events
    console.log('📝 Inserting sample events...');
    await Event.insertMany(sampleEvents);
    console.log(`✅ Successfully inserted ${sampleEvents.length} events`);
    
    // Display inserted events
    console.log('\n📋 Sample Events:');
    sampleEvents.forEach(event => {
      console.log(`   ${event.eventId}. ${event.name} - ${event.date} (${event.price} MATIC)`);
    });
    
    console.log('\n✨ Database seeding completed successfully!\n');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('👋 MongoDB connection closed');
    process.exit(0);
  }
}

// Run the seed function
seedDatabase();
