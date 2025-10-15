export interface Question {
    id: number;
    question: string;
    type: "mcq" | "short" | "image"; // text, short answer, or image options
    options?: string[];   
    sampleImage?: string;            // for MCQ
    images?: string[];                // for image options (paths from /public)
    answer: string;                   // correct answer (text or image file name)
  }
  
  export const questions: Question[] = [
    {
      id: 1,
      question: "At what age do most babies start crawling?",
      type: "mcq",
      options: ["3–5 months", "6–10 months", "11–14 months", "15+ months"],
      answer: "6–10 months",
    },
    {
      id: 2,
      question: "What’s the safest sleeping position for a newborn?",
      type: "mcq",
      options: ["On the back", "On the stomach", "On the side", "Half-sitting"],
      answer: "On the back",
    },
    {
      id: 3,
      question: "👶🍼💤 = ?",
      type: "mcq",
      options: ["Feeding time", "Baby sleeping after feeding", "Crying baby", "Playtime"],
      answer: "Baby sleeping after feeding",
    },
    {
      id: 4,
      question: "What’s the universal “superpower” of all new parents?",
      type: "mcq",
      options: [
        "Sleeping anytime, anywhere",
        "Identifying baby cries by meaning",
        "Eating meals in 2 minutes",
        "Forgetting what day it is",
      ],
      answer: "Identifying baby cries by meaning",
    },
    {
      id: 5,
      question: "What is the most common reason babies wake up at night?",
      type: "mcq",
      options: ["Hunger", "Diaper change", "Noise", "Missing their parents"],
      answer: "Hunger",
    },
    {
      id: 6,
      question: "Which animal is often used to describe a baby’s sleeping position?",
      type: "mcq",
      options: ["Puppy", "Kitten", "Lamb", "Duckling"],
      answer: "Puppy",
    },
    {
      id: 7,
      question: 'Complete the song lyric: "Chanda hai tu, mera _ hai tu"',
      type: "mcq",
      options: ["Sapna", "Pyaara", "Beta", "Khazana"],
      answer: "Pyaara",
    },
    {
      id: 8,
      question: "Which of these images shows a proper way to hold a newborn?",
      type: "image",
      images: ["/pos_1.png", "/pos_2.png", "/pos_3.png", "/pos_4.png"],
      answer: "/pos_1.png",
    },
    {
      id: 9,
      question: "How much does a pack of 30 newborn diapers cost on average in India?",
      type: "mcq",
      options: ["₹150–₹200", "₹200–₹250", "₹250–₹300", "₹300–₹350"],
      answer: "₹250–₹300",
    },
    {
      id: 10,
      question: "I jingle and shake, I make a fun sound, babies love me all around. What am I?",
      type: "short",
      answer: "Rattle",
    },
    {
      id: 11,
      question: "I keep a baby warm and cozy at night, soft and comfy, held tight. What am I?",
      type: "short",
      answer: "Blanket",
    },
    {
      id: 12,
      question: "Whose child is this? 👶",
      sampleImage: "/sample.png", // the image user should match
      type: "image",
      images: [
        "/opt_1.png",
        "/opt_2.png",
        "/opt_3.png",
        "/opt_4.png"
      ],
      answer: "/opt_2.png",
    },
  ];
  