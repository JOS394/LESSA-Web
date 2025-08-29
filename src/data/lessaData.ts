export type LessaEntry = {
  id: number;
  word: string;
  category: string;
  difficulty: 'fácil' | 'medio' | 'difícil';
  description: string;
  image: string;
  choices: string[];
};
export const lessaData: LessaEntry[] = [
  { id: 1, word: 'A', category: 'Abecedario', difficulty: 'fácil', description: 'Letra A en dactilología.', image: 'https://placehold.co/400x300?text=A', choices: ['A','B','C','D'] },
  { id: 2, word: 'B', category: 'Abecedario', difficulty: 'fácil', description: 'Letra B en dactilología.', image: 'https://placehold.co/400x300?text=B', choices: ['B','A','C','D'] },
  { id: 3, word: 'Hola', category: 'Saludos', difficulty: 'fácil', description: 'Saludo común. Mano desde la cabeza hacia adelante.', image: 'https://placehold.co/400x300?text=Hola', choices: ['Hola','Gracias','Adiós','Por favor'] },
  { id: 4, word: 'Gracias', category: 'Saludos', difficulty: 'fácil', description: 'Expresa gratitud, mano desde la barbilla hacia afuera.', image: 'https://placehold.co/400x300?text=Gracias', choices: ['Gracias','Hola','Adiós','Por favor'] },
  { id: 5, word: '1', category: 'Números', difficulty: 'fácil', description: 'Número uno en LESSA.', image: 'https://placehold.co/400x300?text=1', choices: ['1','2','3','4'] }
];
