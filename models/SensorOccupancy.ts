import { Schema, model, models } from 'mongoose';

const SensorOccupancySchema = new Schema(
  {
    restaurantId: {
      type: String,
      required: true,
      index: true,
    },
    tableId: {
      type: Number,
      required: true,
    },
    isOccupied: {
      type: Boolean,
      required: true,
      default: false,
    },
    capacity: {
      type: Number,
      default: 4,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      virtuals: true,
    },
  }
);

SensorOccupancySchema.index({ restaurantId: 1, tableId: 1 }, { unique: true });

const SensorOccupancy =
  models.SensorOccupancy || model('SensorOccupancy', SensorOccupancySchema);

export default SensorOccupancy;
