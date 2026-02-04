const QUOTES = [
  { text: "The simple act of caring is heroic.", author: "Edward Albert" },
  { text: "No one is useless in this world who lightens the burdens of another.", author: "Charles Dickens" },
  { text: "You matter more than you know. Prove it daily.", author: null },
  { text: "Being alive is a gift. Telling someone about it is generosity.", author: null },
  { text: "Connection is the energy that is created between people when they feel seen.", author: "Brené Brown" },
  { text: "Sometimes the bravest thing you can do is let someone know you're okay.", author: null },
  { text: "To live is the rarest thing in the world. Most people exist, that is all.", author: "Oscar Wilde" },
  { text: "The greatest gift you can give someone is proof that you're still here.", author: null },
  { text: "We rise by lifting others.", author: "Robert Ingersoll" },
  { text: "Every day you check in is a day someone doesn't have to worry.", author: null },
  { text: "Every day is a chance to begin again.", author: null },
  { text: "Your presence matters more than you think.", author: null },
  { text: "Small daily rituals are the foundation of trust.", author: null },
  { text: "You are enough, just as you are. But people still want to hear from you.", author: null },
  { text: "Consistency is the true foundation of trust.", author: "Roy T. Bennett" },
  { text: "One day at a time. One tap at a time.", author: null },
  { text: "A journey of a thousand miles begins with a single step.", author: "Lao Tzu" },
  { text: "How we spend our days is how we spend our lives.", author: "Annie Dillard" },
  { text: "Take care of yourself. You never know who needs you tomorrow.", author: null },
  { text: "The world is a better place with you in it. Don't let people wonder.", author: null },
  { text: "Hope is being able to see that there is light despite all of the darkness.", author: "Desmond Tutu" },
  { text: "You are braver than you believe, stronger than you seem, and smarter than you think.", author: "A.A. Milne" },
  { text: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe" },
  { text: "Be gentle with yourself. You're doing the best you can.", author: null },
  { text: "Life is what happens when you're busy making other plans.", author: "John Lennon" },
  { text: "Every morning you wake up is proof you've got more to do.", author: null },
  { text: "Not dead yet? Good. Let someone know.", author: null },
  { text: "The people who love you just want one thing: to know you're okay.", author: null },
  { text: "Showing up is 90% of life.", author: "Woody Allen" },
  { text: "You survived 100% of your worst days. That's a perfect record.", author: null },
  { text: "Today's alive count: still at one hundred percent.", author: null },
];

export function getQuoteForDate(date: Date): { text: string; author: string | null } {
  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000
  );
  return QUOTES[dayOfYear % QUOTES.length];
}
