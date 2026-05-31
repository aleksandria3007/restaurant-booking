import { Schema, model, models } from 'mongoose';

const TableSchema = new Schema({
  restaurantId: { 
    type: String,
    index: true,
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
}, {
  timestamps: true,
  versionKey: false,
  toJSON: {
    virtuals: true,
  },
});

const Table = models.Table || model('Table', TableSchema);
export default Table;
