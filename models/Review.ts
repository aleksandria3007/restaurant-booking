import { Schema, model, models } from 'mongoose';

const ReviewSchema = new Schema(
  {
    restaurantId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    userName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    text: { type: String, required: true, trim: true },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
  }
);

const Review = models.Review || model('Review', ReviewSchema);

export default Review;
