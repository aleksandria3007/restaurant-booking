import mongoose, { Schema, model, models } from 'mongoose';

const TableSchema = new Schema({
  restaurantId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Restaurant'
    // required: true  <-- Видаляємо або коментуємо цей рядок
  },
  number: { 
    type: Number, 
    required: true,
    unique: true 
  },
  capacity: { 
    type: Number, 
    default: 4 // Додаємо дефолтне значення, якщо створюємо новий стіл
  },
  isAvailable: { 
    type: Boolean, 
    default: true 
  }
});

const Table = models.Table || model('Table', TableSchema);
export default Table;