// components/RecipeSuggestions.js
import React, { useEffect, useState } from 'react';
import { firestore } from '@/firebase'; // Ensure this path is correct
import { getDocs, collection } from 'firebase/firestore';
import { Button, Box, Typography } from '@mui/material';

const getRecipeSuggestions = async (items) => {
  const response = await fetch('https://api.openai.com/v1/engines/davinci-codex/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer YOUR_OPENAI_API_KEY`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: `Suggest recipes based on the following items: ${items.join(', ')}`,
      max_tokens: 150
    })
  });
  const data = await response.json();
  return data.choices[0].text;
};

const RecipeSuggestions = () => {
  const [items, setItems] = useState([]);
  const [suggestions, setSuggestions] = useState('');

  useEffect(() => {
    const fetchPantryItems = async () => {
      const querySnapshot = await getDocs(collection(firestore, 'pantry'));
      const itemsData = querySnapshot.docs.map(doc => doc.data().name);
      setItems(itemsData);
    };

    fetchPantryItems();
  }, []);

  const fetchSuggestions = async () => {
    const recipeSuggestions = await getRecipeSuggestions(items);
    setSuggestions(recipeSuggestions);
  };

  return (
    <Box>
      <Typography variant="h4">Recipe Suggestions</Typography>
      <Button variant="contained" onClick={fetchSuggestions}>Get Recipe Suggestions</Button>
      <pre>{suggestions}</pre>
    </Box>
  );
};

export default RecipeSuggestions;
