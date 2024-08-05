'use client';
import { useEffect, useState } from "react";
import { Box, Typography, Button, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, InputAdornment } from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import { firestore } from "@/firebase"; // Adjust this import according to your file structure
import CaptureImage from "@/CaptureImage";
import ClassifyAndUpload from "@/ClassifyAndUpload";
import RecipeSuggestions from "@/RecipeSuggestions";

const Home = () => {
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('');
  const [newItemType, setNewItemType] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!firestore) {
      console.warn("Firestore is not initialized.");
      return;
    }

    const fetchData = async () => {
      try {
        const inventoryCollection = await firestore.collection('inventory').get();
        const inventoryData = inventoryCollection.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setInventory(inventoryData);
        setFilteredInventory(inventoryData);
      } catch (error) {
        console.error("Error fetching inventory data: ", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const filterInventory = () => {
      if (searchQuery) {
        const filtered = inventory.filter(item =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.type.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredInventory(filtered);
      } else {
        setFilteredInventory(inventory);
      }
    };

    filterInventory();
  }, [searchQuery, inventory]);

  const handleRemoveItem = async (id) => {
    setInventory(inventory.filter(item => item.id !== id));
    if (!firestore) return;
    try {
      await firestore.collection('inventory').doc(id).delete();
      console.log(`Item with id ${id} deleted successfully`);
    } catch (error) {
      console.error("Error removing item: ", error);
    }
  };

  const handleAddItem = async () => {
    if (!newItemName || !newItemQuantity || !newItemType) {
      console.warn("Item name, quantity, and type are required.");
      return;
    }

    const existingItem = inventory.find(item => item.name.toLowerCase() === newItemName.toLowerCase());
    if (existingItem) {
      const updatedItem = { ...existingItem, quantity: existingItem.quantity + parseInt(newItemQuantity) };
      setInventory(inventory.map(item => item.id === existingItem.id ? updatedItem : item));
      try {
        await firestore.collection('inventory').doc(existingItem.id).update(updatedItem);
        console.log(`Item ${existingItem.name} updated successfully`);
      } catch (error) {
        console.error("Error updating item: ", error);
      }
    } else {
      const newItem = { id: Date.now().toString(), name: newItemName, quantity: parseInt(newItemQuantity), type: newItemType, dateAdded: new Date().toLocaleString() };
      setInventory([...inventory, newItem]);
      try {
        await firestore.collection('inventory').doc(newItem.id).set(newItem);
        console.log(`Item ${newItem.name} added successfully`);
      } catch (error) {
        console.error("Error adding new item: ", error);
      }
    }

    setNewItemName('');
    setNewItemQuantity('');
    setNewItemType('');
  };

  const handleIncrementItem = async (id) => {
    const item = inventory.find(item => item.id === id);
    if (!item) return;

    const updatedItem = { ...item, quantity: item.quantity + 1 };
    setInventory(inventory.map(item => item.id === id ? updatedItem : item));
    try {
      await firestore.collection('inventory').doc(id).update(updatedItem);
      console.log(`Item ${item.name} incremented successfully`);
    } catch (error) {
      console.error("Error incrementing item: ", error);
    }
  };

  const handleDecrementItem = async (id) => {
    const item = inventory.find(item => item.id === id);
    if (!item) return;

    if (item.quantity === 1) {
      await handleRemoveItem(id);
    } else {
      const updatedItem = { ...item, quantity: item.quantity - 1 };
      setInventory(inventory.map(item => item.id === id ? updatedItem : item));
      try {
        await firestore.collection('inventory').doc(id).update(updatedItem);
        console.log(`Item ${item.name} decremented successfully`);
      } catch (error) {
        console.error("Error decrementing item: ", error);
      }
    }
  };

  return (
    <Box p={2}>
      <Typography variant="h4" gutterBottom>Inventory Management</Typography>
      <Box display="flex" alignItems="center" mb={2}>
        <TextField 
          label="Enter Item" 
          variant="outlined" 
          value={newItemName} 
          onChange={(e) => setNewItemName(e.target.value)} 
          style={{ marginRight: '10px' }}
        />
        <TextField 
          label="Enter Quantity" 
          variant="outlined" 
          type="number" 
          value={newItemQuantity} 
          onChange={(e) => setNewItemQuantity(e.target.value)} 
          style={{ marginRight: '10px' }}
        />
        <TextField 
          label="Enter Type" 
          variant="outlined" 
          value={newItemType} 
          onChange={(e) => setNewItemType(e.target.value)} 
          style={{ marginRight: '10px' }}
        />
        <Button variant="contained" onClick={handleAddItem} style={{ marginRight: '10px' }}>Add</Button>
        <Button variant="contained" color="secondary" onClick={() => { setNewItemName(''); setNewItemQuantity(''); setNewItemType(''); }}>Delete</Button>
      </Box>
      <TextField 
        label="Search" 
        variant="outlined" 
        value={searchQuery} 
        onChange={(e) => setSearchQuery(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        fullWidth
        style={{ marginBottom: '20px' }}
      />
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Item Name</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Date Added</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredInventory.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>{item.type}</TableCell>
                <TableCell>{item.dateAdded}</TableCell>
                <TableCell>
                  <Button variant="contained" color="primary" onClick={() => handleIncrementItem(item.id)} style={{ marginRight: '5px' }}>Add</Button>
                  <Button variant="contained" color="secondary" onClick={() => handleDecrementItem(item.id)} style={{ marginRight: '5px' }}>Reduce</Button>
                  <Button variant="contained" color="error" onClick={() => handleRemoveItem(item.id)}>Remove</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <CaptureImage />
      <ClassifyAndUpload />
      <RecipeSuggestions />
    </Box>
  );
};

export default Home;
