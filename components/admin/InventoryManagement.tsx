import React, { useEffect, useState } from 'react';
import { MedicineInventory, MedicineCategory } from '../../types';
import { getMedicineInventory, addMedicineToInventory, updateMedicineInInventory } from '../../services/mockApi';
import { PlusCircle, Edit, AlertTriangle } from 'lucide-react';

const InventoryForm: React.FC<{
    onSubmit: (item: Omit<MedicineInventory, 'medicineId'> | MedicineInventory) => void;
    onClose: () => void;
    itemToEdit?: MedicineInventory | null;
}> = ({ onSubmit, onClose, itemToEdit }) => {
    const [item, setItem] = useState<Omit<MedicineInventory, 'medicineId'>>({
        medicineName: '',
        quantity: 0,
        expiryDate: '',
        category: MedicineCategory.Tablet,
        threshold: 10,
    });

    useEffect(() => {
        if (itemToEdit) {
            setItem(itemToEdit);
        }
    }, [itemToEdit]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setItem(prev => ({ ...prev, [name]: name === 'quantity' || name === 'threshold' ? parseInt(value) : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(itemToEdit ? { ...item, medicineId: itemToEdit.medicineId } : item);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-8 w-full max-w-lg">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">{itemToEdit ? 'Edit Medicine' : 'Add New Medicine'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input name="medicineName" value={item.medicineName} onChange={handleChange} placeholder="Medicine Name" className="w-full border-gray-300 rounded-md" required />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input name="quantity" type="number" value={item.quantity} onChange={handleChange} placeholder="Quantity" className="w-full border-gray-300 rounded-md" required />
                        <input name="threshold" type="number" value={item.threshold} onChange={handleChange} placeholder="Low Stock Threshold" className="w-full border-gray-300 rounded-md" required />
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <select name="category" value={item.category} onChange={handleChange} className="w-full border-gray-300 rounded-md">
                            {Object.values(MedicineCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                        <input name="expiryDate" type="date" value={item.expiryDate} onChange={handleChange} placeholder="Expiry Date" className="w-full border-gray-300 rounded-md" required />
                     </div>
                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-primary-dark">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const InventoryManagement: React.FC = () => {
    const [inventory, setInventory] = useState<MedicineInventory[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [itemToEdit, setItemToEdit] = useState<MedicineInventory | null>(null);

    const fetchData = async () => {
        const data = await getMedicineInventory();
        setInventory(data);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleFormSubmit = async (item: Omit<MedicineInventory, 'medicineId'> | MedicineInventory) => {
        if ('medicineId' in item) {
            await updateMedicineInInventory(item.medicineId, item);
        } else {
            await addMedicineToInventory(item);
        }
        setShowForm(false);
        setItemToEdit(null);
        fetchData();
    };

    const openEditForm = (item: MedicineInventory) => {
        setItemToEdit(item);
        setShowForm(true);
    };

    const openAddForm = () => {
        setItemToEdit(null);
        setShowForm(true);
    };


    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Inventory Management</h1>
                <button onClick={openAddForm} className="flex items-center space-x-2 px-4 py-2 bg-brand-primary text-white rounded-lg shadow hover:bg-brand-primary-dark transition-colors">
                    <PlusCircle size={20} />
                    <span>Add New Medicine</span>
                </button>
            </div>

            {showForm && <InventoryForm onSubmit={handleFormSubmit} onClose={() => { setShowForm(false); setItemToEdit(null); }} itemToEdit={itemToEdit} />}

            <div className="bg-white rounded-xl shadow p-6">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Medicine Name</th>
                                <th scope="col" className="px-6 py-3">Category</th>
                                <th scope="col" className="px-6 py-3">Quantity</th>
                                <th scope="col" className="px-6 py-3">Expiry Date</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                                <th scope="col" className="px-6 py-3">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {inventory.map(item => (
                                <tr key={item.medicineId} className={`border-b ${item.quantity < item.threshold ? 'bg-yellow-50' : 'bg-white'} hover:bg-gray-50`}>
                                    <td className="px-6 py-4 font-medium text-gray-900">{item.medicineName}</td>
                                    <td className="px-6 py-4">{item.category}</td>
                                    <td className="px-6 py-4 font-bold">{item.quantity}</td>
                                    <td className="px-6 py-4">{new Date(item.expiryDate).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">
                                        {item.quantity < item.threshold && (
                                            <span className="flex items-center text-xs font-semibold text-yellow-800 bg-yellow-200 px-2 py-1 rounded-full">
                                                <AlertTriangle size={14} className="mr-1" /> Low Stock
                                            </span>
                                        )}
                                        {new Date(item.expiryDate) < new Date() && (
                                             <span className="flex items-center text-xs font-semibold text-red-800 bg-red-200 px-2 py-1 rounded-full">
                                                <AlertTriangle size={14} className="mr-1" /> Expired
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <button onClick={() => openEditForm(item)} className="text-brand-primary hover:underline">
                                            <Edit size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default InventoryManagement;