import mongoose from "mongoose";

// Course Category Schema
const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    unique: true
  },
  description: {
    type: String,
    required: [true, 'Category description is required']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  coursesCount: {
    type: Number,
    default: 0
  },
  icon: {
    type: String,
    default: ''
  }
}, { timestamps: true });

// Course Schema
const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: [true, 'Course description is required']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Course category is required']
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Course instructor is required']
  },
  thumbnail: {
    type: String,
    default: ''
  },
  duration: {
    type: Number, // in minutes
    required: [true, 'Course duration is required']
  },
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  modules: [{
    title: {
      type: String,
      required: true
    },
    description: String,
    lessons: [{
      title: {
        type: String,
        required: true
      },
      content: {
        type: String,
        required: true
      },
      videoUrl: String,
      duration: Number, // in minutes
      resources: [{
        title: String,
        fileUrl: String,
        fileType: String
      }],
      quiz: {
        questions: [{
          question: String,
          options: [String],
          correctAnswer: Number
        }],
        passingScore: {
          type: Number,
          default: 70
        }
      }
    }]
  }],
  enrolledStudents: {
    type: Number,
    default: 0
  },
  ratings: {
    average: {
      type: Number,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    }
  },
  tags: [String],
  isPublished: {
    type: Boolean,
    default: false
  },
  price: {
    type: Number,
    default: 0
  },
  isFeatured: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Student Progress Schema
const progressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  completedLessons: [{
    lessonId: String,
    completedAt: Date
  }],
  quizResults: [{
    quizId: String,
    score: Number,
    passedAt: Date
  }],
  progress: {
    type: Number, // percentage
    default: 0
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  lastAccessedAt: {
    type: Date,
    default: Date.now
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: Date
}, { timestamps: true });

// Certificate Schema
const certificateSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  certificateId: {
    type: String
  },
  issueDate: {
    type: Date,
    default: Date.now
  },
  certificateUrl: String,
  verificationLink: String
}, { timestamps: true });

// Search History Schema
const searchHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  query: {
    type: String,
    required: true
  },
  results: {
    type: Number,
    default: 0
  },
  searchedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Course Review Schema
const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  review: {
    type: String,
    required: true
  },
  isVerified: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Create indexes
courseSchema.index({ title: 'text', description: 'text', tags: 'text' });
categorySchema.index({ name: 'text', description: 'text' });
searchHistorySchema.index({ query: 1, user: 1 });
progressSchema.index({ user: 1, course: 1 }, { unique: true });
certificateSchema.index({ certificateId: 1 }, { unique: true });

// Pre-save hooks
courseSchema.pre('save', function(next) {
  if (!this.slug) {
    this.slug = this.title.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-');
  }
  next();
});

categorySchema.pre('save', function(next) {
  if (!this.slug) {
    this.slug = this.name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-');
  }
  next();
});

// Create models
const Category = mongoose.model('Category', categorySchema);
const Course = mongoose.model('Course', courseSchema);
const Progress = mongoose.model('Progress', progressSchema);
const Certificate = mongoose.model('Certificate', certificateSchema);
const SearchHistory = mongoose.model('SearchHistory', searchHistorySchema);
const Review = mongoose.model('Review', reviewSchema);

export { Category, Course, Progress, Certificate, SearchHistory, Review }; 