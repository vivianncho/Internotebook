export type Quote = { text: string; author: string };

const quotes: Quote[] = [
  { text: 'The expert in anything was once a beginner.', author: 'Helen Hayes' },
  { text: 'It always seems impossible until it is done.', author: 'Nelson Mandela' },
  { text: 'Do what you can, with what you have, where you are.', author: 'Theodore Roosevelt' },
  { text: 'You do not have to be great to start, but you have to start to be great.', author: 'Zig Ziglar' },
  { text: 'Small deeds done are better than great deeds planned.', author: 'Peter Marshall' },
  { text: 'Learning never exhausts the mind.', author: 'Leonardo da Vinci' },
  { text: 'The beautiful thing about learning is that nobody can take it away from you.', author: 'B.B. King' },
  { text: 'Opportunities don’t happen. You create them.', author: 'Chris Grosser' },
  { text: 'Success is the sum of small efforts, repeated day in and day out.', author: 'Robert Collier' },
  { text: 'Ask the question. The worst answer is one you already had.', author: 'Unknown' },
  { text: 'Curiosity is the wick in the candle of learning.', author: 'William Arthur Ward' },
  { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' },
  { text: 'A person who never made a mistake never tried anything new.', author: 'Albert Einstein' },
  { text: 'Believe you can and you’re halfway there.', author: 'Theodore Roosevelt' },
  { text: 'Well done is better than well said.', author: 'Benjamin Franklin' },
  { text: 'Tell me and I forget. Teach me and I remember. Involve me and I learn.', author: 'Benjamin Franklin' },
  { text: 'Great things are done by a series of small things brought together.', author: 'Vincent van Gogh' },
  { text: 'Act as if what you do makes a difference. It does.', author: 'William James' },
  { text: 'Don’t watch the clock; do what it does. Keep going.', author: 'Sam Levenson' },
  { text: 'Your network is your net worth, and every coffee chat is a deposit.', author: 'Unknown' },
  { text: 'Feedback is the breakfast of champions.', author: 'Ken Blanchard' },
  { text: 'You are allowed to be both a masterpiece and a work in progress.', author: 'Sophia Bush' },
  { text: 'The secret of getting ahead is getting started.', author: 'Mark Twain' },
  { text: 'Growth is never by mere chance; it is the result of forces working together.', author: 'James Cash Penney' },
  { text: 'Be so good they can’t ignore you.', author: 'Steve Martin' },
  { text: 'Nothing will work unless you do.', author: 'Maya Angelou' },
  { text: 'Every accomplishment starts with the decision to try.', author: 'John F. Kennedy' },
  { text: 'Rest is not idleness. A short break can make the next hour your best one.', author: 'Unknown' },
  { text: 'In learning you will teach, and in teaching you will learn.', author: 'Phil Collins' },
  { text: 'The more that you read, the more things you will know.', author: 'Dr. Seuss' },
  { text: 'Quality is not an act, it is a habit.', author: 'Aristotle' },
];

/** Same quote all day, a new one each calendar day (local time). */
export function quoteOfTheDay(date = new Date()): Quote {
  const dayNumber = Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000);
  return quotes[dayNumber % quotes.length];
}
