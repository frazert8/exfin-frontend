import { supabase } from './supabaseClient';

// --- UTILS & MOCK DATA ---
export const formatCurrency = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

const generateMockData = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  let cash = 45000;
  return months.map((month, i) => {
    const rev = Math.floor(45000 + (i * 3500) + (Math.random() * 5000));
    const exp = Math.floor(rev * 0.65);
    cash += (rev - exp);
    return {
      month, 
      id: i,
      revenue: rev, 
      cogs: Math.floor(rev * 0.4), 
      opex: Math.floor(rev * 0.25), 
      netIncome: rev - exp, 
      cashOnHand: cash, 
      headcount: 5 + Math.floor(i/4)
    };
  });
};


// --- API FUNCTIONS ---
export const getFinancialData = async () => {
  console.log("Attempting to fetch data from Supabase...");
  const { data, error } = await supabase
    .from('financials')
    .select('*')
    .order('id', { ascending: true });

  if (error) {
    console.error("Supabase fetch error:", error);
    console.log("Falling back to mock data due to Supabase error.");
    return { data: generateMockData(), source: 'local' };
  }

  if (data && data.length > 0) {
    console.log("Successfully fetched data from Supabase.");
    return { data: data.map((d, i) => ({...d, index: i})), source: 'supabase' };
  }

  console.log("Supabase returned no data. Falling back to mock data.");
  return { data: generateMockData(), source: 'local' };
};

export const seedDatabase = async () => {
    console.log("Seeding database with mock data...");
    const mock = generateMockData();
    const { error } = await supabase.from('financials').insert(mock);
    if (error) {
        console.error("Error seeding database:", error.message);
        alert("Error: " + error.message);
        return false;
    }
    console.log("Database seeded successfully.");
    return true;
};
