import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Category, Course } from '../models/educationmodel.js';
import User from '../models/usermodel.js';
import { initializeCategories } from '../services/educationService.js';
import { generateSlug } from '../helpers/educationhelper.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '..', '..', '.env');

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  console.error(`No .env file found at: ${envPath}`);
  process.exit(1);
}

// Function to create a sample instructor if none exists
const createInstructor = async () => {
  try {
    // Check if we already have an instructor
    let instructor = await User.findOne({ role: 'Educator' });
    
    if (!instructor) {
      instructor = await User.create({
        firstname: 'John',
        lastname: 'Farmer',
        fullname: 'John Farmer',
        email: 'instructor@agricsmart.com',
        password: '$2a$10$X7o4.KTbD0HbLMZXAZPJWOkLD0Xoe1Bz/GBQxfLAhXhRRQvGJE2Uy', // hashed 'password123'
        role: 'Educator',
        isAuthenticated: true,
        phone: '+233123456789',
        profilePic: 'https://randomuser.me/api/portraits/men/1.jpg'
      });
      console.log('Created sample instructor:', instructor._id);
    } else {
      console.log('Using existing instructor:', instructor._id);
    }
    
    return instructor;
  } catch (error) {
    console.error('Error creating instructor:', error);
    throw error;
  }
};

// Function to create a course
const createCourse = async (courseData, categoryId, instructorId) => {
  try {
    const { title, description, duration, rating, students, level = 'Beginner' } = courseData;
    
    // Check if course already exists
    const existingCourse = await Course.findOne({ title });
    if (existingCourse) {
      console.log(`Course already exists: ${title}`);
      return existingCourse;
    }
    
    // Create sample modules and lessons
    const modules = [
      {
        title: 'Introduction',
        description: 'Get started with the basics',
        lessons: [
          {
            title: 'Course Overview',
            content: `<h1>Welcome to ${title}</h1><p>${description}</p><p>In this course, you will learn everything you need to know about this subject.</p>`,
            videoUrl: 'https://www.youtube.com/watch?v=example',
            duration: 15,
            resources: [
              {
                title: 'Course Syllabus',
                fileUrl: 'https://example.com/syllabus.pdf',
                fileType: 'PDF'
              }
            ]
          },
          {
            title: 'Getting Started',
            content: '<h1>Getting Started</h1><p>Let\'s begin our journey with the fundamental concepts.</p>',
            videoUrl: 'https://www.youtube.com/watch?v=example2',
            duration: 20
          }
        ]
      },
      {
        title: 'Core Concepts',
        description: 'Master the essential knowledge',
        lessons: [
          {
            title: 'Key Principles',
            content: '<h1>Key Principles</h1><p>Understanding the core principles is essential for success in this field.</p>',
            videoUrl: 'https://www.youtube.com/watch?v=example3',
            duration: 30,
            quiz: {
              questions: [
                {
                  question: 'What is the most important principle?',
                  options: ['Option A', 'Option B', 'Option C', 'Option D'],
                  correctAnswer: 2
                }
              ],
              passingScore: 70
            }
          },
          {
            title: 'Practical Applications',
            content: '<h1>Practical Applications</h1><p>Let\'s see how these concepts apply in real-world scenarios.</p>',
            videoUrl: 'https://www.youtube.com/watch?v=example4',
            duration: 25
          }
        ]
      },
      {
        title: 'Advanced Techniques',
        description: 'Take your skills to the next level',
        lessons: [
          {
            title: 'Advanced Strategies',
            content: '<h1>Advanced Strategies</h1><p>Now that you understand the basics, let\'s explore more advanced techniques.</p>',
            videoUrl: 'https://www.youtube.com/watch?v=example5',
            duration: 35
          },
          {
            title: 'Case Studies',
            content: '<h1>Case Studies</h1><p>Learn from real examples and success stories in the field.</p>',
            videoUrl: 'https://www.youtube.com/watch?v=example6',
            duration: 40
          }
        ]
      }
    ];
    
    // Calculate total duration from modules
    const totalDuration = modules.reduce((total, module) => {
      return total + module.lessons.reduce((lessonTotal, lesson) => {
        return lessonTotal + (lesson.duration || 0);
      }, 0);
    }, 0);
    
    // Create the course
    const course = await Course.create({
      title,
      slug: generateSlug(title),
      description,
      category: categoryId,
      instructor: instructorId,
      thumbnail: `https://source.unsplash.com/random/800x600/?agriculture,${encodeURIComponent(title.split(' ')[0])}`,
      duration: duration * 7 * 24 * 60, // Convert weeks to minutes
      level,
      modules,
      enrolledStudents: students,
      ratings: {
        average: rating,
        count: Math.floor(students / 5) // Roughly 20% of students leave ratings
      },
      tags: title.toLowerCase().split(' '),
      isPublished: true,
      isFeatured: rating >= 4.8, // Feature highest rated courses
      price: 0 // Free courses
    });
    
    console.log(`Created course: ${title}`);
    return course;
  } catch (error) {
    console.error(`Error creating course ${courseData.title}:`, error);
    throw error;
  }
};

// Main seed function
const seedEducationData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.DB_URI);
    console.log('Connected to MongoDB');
    
    // Initialize categories
    await initializeCategories();
    console.log('Categories initialized');
    
    // Create instructor
    const instructor = await createInstructor();
    
    // Get categories
    const organicFarming = await Category.findOne({ name: 'Organic Farming' });
    const agricEconomics = await Category.findOne({ name: 'Agriculture Economics' });
    const agricTech = await Category.findOne({ name: 'Agricultural Digital Technology' });
    const animalCare = await Category.findOne({ name: 'Animal Care Skills' });
    
    if (!organicFarming || !agricEconomics || !agricTech || !animalCare) {
      throw new Error('Categories not found. Make sure initializeCategories() is working properly.');
    }
    
    // Define courses for each category
    const organicFarmingCourses = [
      {
        title: 'Introduction to Organic Farming',
        description: 'Learn the fundamentals of organic agriculture and sustainable farming practices.',
        duration: 6,
        rating: 4.8,
        students: 1800,
        level: 'Beginner'
      },
      {
        title: 'Soil Health Management',
        description: 'Master techniques for building and maintaining healthy soil in organic systems.',
        duration: 8,
        rating: 4.7,
        students: 1500,
        level: 'Intermediate'
      },
      {
        title: 'Organic Pest Control',
        description: 'Natural and biological methods to manage pests in organic crop production.',
        duration: 4,
        rating: 4.9,
        students: 2100,
        level: 'Intermediate'
      },
      {
        title: 'Organic Certification Process',
        description: 'Navigate the requirements and steps to achieve organic certification for your farm.',
        duration: 3,
        rating: 4.6,
        students: 950,
        level: 'Advanced'
      }
    ];
    
    // Agriculture Economics courses
    const agricEconomicsCourses = [
      {
        title: 'Farm Business Management',
        description: 'Learn how to run a profitable and sustainable agricultural business.',
        duration: 10,
        rating: 4.6,
        students: 1200,
        level: 'Intermediate'
      },
      {
        title: 'Agricultural Market Analysis',
        description: 'Analyze market trends and develop strategies for agricultural products.',
        duration: 6,
        rating: 4.5,
        students: 950,
        level: 'Advanced'
      },
      {
        title: 'Farm Financial Planning',
        description: 'Build comprehensive financial plans for farm operations of any size.',
        duration: 8,
        rating: 4.7,
        students: 1100,
        level: 'Intermediate'
      },
      {
        title: 'Agricultural Policy & Subsidies',
        description: 'Navigate government policies, subsidies, and programs for farmers.',
        duration: 5,
        rating: 4.4,
        students: 780,
        level: 'Beginner'
      }
    ];
    
    // Agricultural Digital Technology courses
    const agricTechCourses = [
      {
        title: 'Precision Agriculture Fundamentals',
        description: 'Learn how to use GPS, sensors, and mapping to optimize farm operations.',
        duration: 7,
        rating: 4.9,
        students: 2300,
        level: 'Beginner'
      },
      {
        title: 'Farm Drones & Remote Sensing',
        description: 'Master the use of drones for crop monitoring, mapping, and spraying.',
        duration: 6,
        rating: 4.8,
        students: 1900,
        level: 'Intermediate'
      },
      {
        title: 'Smart Irrigation Systems',
        description: 'Implement water-efficient irrigation using IoT sensors and automation.',
        duration: 5,
        rating: 4.7,
        students: 1500,
        level: 'Intermediate'
      },
      {
        title: 'Farm Management Software',
        description: 'Digitize record-keeping and operations management with modern software tools.',
        duration: 4,
        rating: 4.6,
        students: 1700,
        level: 'Beginner'
      }
    ];
    
    // Animal Care Skills courses
    const animalCareCourses = [
      {
        title: 'Sustainable Livestock Management',
        description: 'Practice ethical and sustainable approaches to raising livestock.',
        duration: 9,
        rating: 4.7,
        students: 1400,
        level: 'Intermediate'
      },
      {
        title: 'Poultry Production & Health',
        description: 'Learn commercial and small-scale poultry production techniques.',
        duration: 6,
        rating: 4.6,
        students: 1200,
        level: 'Beginner'
      },
      {
        title: 'Dairy Management Systems',
        description: 'Master the art and science of dairy farm management and milk production.',
        duration: 8,
        rating: 4.5,
        students: 950,
        level: 'Advanced'
      },
      {
        title: 'Animal Health & Disease Prevention',
        description: 'Identify, prevent, and manage common livestock health issues.',
        duration: 7,
        rating: 4.8,
        students: 1300,
        level: 'Intermediate'
      }
    ];
    
    // Create all courses
    for (const course of organicFarmingCourses) {
      await createCourse(course, organicFarming._id, instructor._id);
    }
    
    for (const course of agricEconomicsCourses) {
      await createCourse(course, agricEconomics._id, instructor._id);
    }
    
    for (const course of agricTechCourses) {
      await createCourse(course, agricTech._id, instructor._id);
    }
    
    for (const course of animalCareCourses) {
      await createCourse(course, animalCare._id, instructor._id);
    }
    
    console.log('All courses created successfully!');
    
    // Update category course counts
    await Category.updateOne(
      { _id: organicFarming._id },
      { coursesCount: organicFarmingCourses.length }
    );
    
    await Category.updateOne(
      { _id: agricEconomics._id },
      { coursesCount: agricEconomicsCourses.length }
    );
    
    await Category.updateOne(
      { _id: agricTech._id },
      { coursesCount: agricTechCourses.length }
    );
    
    await Category.updateOne(
      { _id: animalCare._id },
      { coursesCount: animalCareCourses.length }
    );
    
    console.log('Category course counts updated');
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    
    console.log('Education data seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding education data:', error);
  }
};

// Export the function for importing elsewhere
export { seedEducationData };

// Run the seed function if this file is executed directly
const isMainModule = process.argv[1] === fileURLToPath(import.meta.url);
if (isMainModule) {
  seedEducationData();
} 