import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./KitchenPage.css";

const token = localStorage.getItem("token");
const uid = localStorage.getItem("uid");

function KitchenPage() {
  const [restaurantMenu, setRestaurantMenu] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [newItem, setNewItem] = useState({
    FOOD_NAME: "",
    PRICE: "",
    FOOD_ALLERGENS: "",
  });
  const [editingItem, setEditingItem] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch(`http://localhost:8080/menu/withuid/${uid}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      if (Array.isArray(data)) setRestaurantMenu(data);
      else throw new Error("Invalid data format");
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAllergens = (menuId) => {
    setSelectedItem(selectedItem === menuId ? null : menuId);
  };

  const handleAddItem = async () => {
    if (!newItem.FOOD_NAME || !newItem.PRICE) return alert("Name and price are required!");

    try {
      const response = await fetch("http://localhost:8080/menu/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...newItem, UID: uid }),
      });

      if (!response.ok) throw new Error("Failed to add item");

      setNewItem({ FOOD_NAME: "", PRICE: "", FOOD_ALLERGENS: "" });
      fetchData();
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };

  const handleEditItem = async () => {
    if (!editingItem.FOOD_NAME || !editingItem.PRICE) return alert("Name and price are required!");

    try {
      const response = await fetch(`http://localhost:8080/menu/update/${editingItem.MENU_ID}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editingItem),
      });

      if (!response.ok) throw new Error("Failed to update item");

      setEditingItem(null);
      fetchData();
    } catch (error) {
      console.error("Error updating item:", error);
    }
  };

  const handleDeleteItem = async (menuId) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      const response = await fetch(`http://localhost:8080/menu/delete/${menuId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ UID: uid }),
      });

      if (!response.ok) throw new Error("Failed to delete item");

      fetchData();
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  if (isLoading) return <div className="status-message">Loading menu...</div>;
  if (error) return <div className="status-message error">Error: {error}</div>;
  if (!restaurantMenu.length) return <div className="status-message">No menu items available.</div>;

  return (
    <div className="kitchen-container">
      <h2 className="menu-title">Menu</h2>

      {/* New Item Form */}
      <div className="form-container">
        <h3>Add New Item</h3>
        <input
          type="text"
          placeholder="Food Name"
          value={newItem.FOOD_NAME}
          onChange={(e) => setNewItem({ ...newItem, FOOD_NAME: e.target.value })}
        />
        <input
          type="number"
          placeholder="Price"
          value={newItem.PRICE}
          onChange={(e) => setNewItem({ ...newItem, PRICE: e.target.value })}
        />
        <input
          type="text"
          placeholder="Allergens (optional)"
          value={newItem.FOOD_ALLERGENS}
          onChange={(e) => setNewItem({ ...newItem, FOOD_ALLERGENS: e.target.value })}
        />
        <button onClick={handleAddItem}>Add Item</button>
      </div>

      {/* Menu List */}
      <div className="menu-section">
        {restaurantMenu.map((item) => (
          <div key={item.MENU_ID} className="menu-item">
            {editingItem?.MENU_ID === item.MENU_ID ? (
              <>
                <input
                  type="text"
                  value={editingItem.FOOD_NAME}
                  onChange={(e) => setEditingItem({ ...editingItem, FOOD_NAME: e.target.value })}
                />
                <input
                  type="number"
                  value={editingItem.PRICE}
                  onChange={(e) => setEditingItem({ ...editingItem, PRICE: e.target.value })}
                />
                <input
                  type="text"
                  value={editingItem.FOOD_ALLERGENS}
                  onChange={(e) => setEditingItem({ ...editingItem, FOOD_ALLERGENS: e.target.value })}
                />
                <button onClick={handleEditItem}>Save</button>
                <button onClick={() => setEditingItem(null)}>Cancel</button>
              </>
            ) : (
              <>
                <div className="food-info" onClick={() => toggleAllergens(item.MENU_ID)}>
                  {item.FOOD_NAME} - <span className="price">${item.PRICE}</span>
                </div>
                {selectedItem === item.MENU_ID && item.FOOD_ALLERGENS && (
                  <div className="allergens">
                    <strong>Allergens:</strong> {item.FOOD_ALLERGENS}
                  </div>
                )}
                <button onClick={() => setEditingItem(item)}>Edit</button>
                <button onClick={() => handleDeleteItem(item.MENU_ID)}>Delete</button>
              </>
            )}
          </div>
        ))}
      </div>

      <button onClick={() => navigate(-1)} className="back-button">
        Back
      </button>
    </div>
  );
}

export default KitchenPage;
