import chromadb
from chromadb.config import Settings

# Local ChromaDB initialize karo (Yeh data ko disk par save karega)
chroma_client = chromadb.PersistentClient(path="./chroma_db")

def train_restaurant_menu(restaurant_id: int, menu: dict):
    """Menu ko AI ke Vector DB (RAG) mein train karta hai"""
    collection_name = f"restaurant_{restaurant_id}_menu"
    
    # Agar pehle se collection hai toh delete karo (naya train karne ke liye)
    try:
        chroma_client.delete_collection(name=collection_name)
    except:
        pass
    
    collection = chroma_client.create_collection(name=collection_name)
    
    documents = []
    metadatas = []
    ids = []
    
    for idx, (item_name, details) in enumerate(menu.items()):
        # AI ke liye text banao
        text = f"{item_name} price is {details['price']} PKR. Available: {details.get('available', True)}"
        documents.append(text)
        metadatas.append({"item_name": item_name, "price": details['price']})
        ids.append(f"item_{idx}")
    
    if documents:
        collection.add(documents=documents, metadatas=metadatas, ids=ids)
        print(f"✅ Menu trained for restaurant {restaurant_id}")
        return True
    return False

def search_menu(restaurant_id: int, query: str):
    """Customer ke sawal ke mutabiq menu se best items dhoondta hai"""
    collection_name = f"restaurant_{restaurant_id}_menu"
    try:
        collection = chroma_client.get_collection(name=collection_name)
        results = collection.query(query_texts=[query], n_results=3)
        return results['documents'][0] if results['documents'] else []
    except Exception as e:
        print(f"RAG Error: {e}")
        return []