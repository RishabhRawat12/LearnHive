import { Router } from "express";
import prisma from "../db";
import { Prisma } from "@prisma/client";

const tutorRoutes = Router();

/**
 * GET /api/tutors
 * Search and filter for tutors.
 */
tutorRoutes.get("/", async (req, res) => {
  const { search, skills, minRating } = req.query;

  try {
    // 1. Define the base query filters
    const where: Prisma.TutorProfileWhereInput = {
      user: {
        role: "tutor", // Ensure we only get tutors
      },
    };

    // 2. Add search filter (name or bio)
    if (typeof search === "string" && search.trim() !== "") {
      where.OR = [
        { user: { name: { contains: search } } },
        { bio: { contains: search } },
      ];
    }

    // 3. Add skills filter
    if (typeof skills === "string" && skills.trim() !== "") {
      const skillList = skills.split(",");
      where.skills = {
        some: {
          name: {
            in: skillList,
          },
        },
      };
    }

    // 4. Fetch tutors matching filters, including their relations
    const tutors = await prisma.tutorProfile.findMany({
      where,
      include: {
        user: {
          select: { name: true, email: true }, // Select only public user info
        },
        skills: true,
        reviews: {
          select: { rating: true }, // Only select rating for avg calculation
        },
      },
    });

    // 5. Calculate average rating and format the response
    let formattedTutors = tutors.map((tutor) => {
      const totalRating = tutor.reviews.reduce(
        (acc, review) => acc + review.rating,
        0
      );
      const average_rating =
        tutor.reviews.length > 0 ? totalRating / tutor.reviews.length : 0;

      return {
        user_id: tutor.user_id,
        name: tutor.user.name,
        bio: tutor.bio,
        hourly_rate: tutor.hourly_rate,
        avatar_url: tutor.avatar_url,
        skills: tutor.skills.map((s) => s.name), // Return just skill names
        average_rating: parseFloat(average_rating.toFixed(1)),
        review_count: tutor.reviews.length,
      };
    });

    // 6. Filter by minRating after calculating the average
    if (typeof minRating === "string" && parseFloat(minRating) > 0) {
      formattedTutors = formattedTutors.filter(
        (tutor) => tutor.average_rating >= parseFloat(minRating)
      );
    }

    res.json(formattedTutors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching tutors" });
  }
});

/**
 * GET /api/tutors/:id
 * Get a single tutor's full profile.
 */
tutorRoutes.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { user_id: id },
      include: {
        user: {
          select: { name: true, email: true, created_at: true },
        },
        skills: true, // Full skill details
        reviews: {
          // Full review details, include the student's name
          include: {
            student: {
              select: { name: true },
            },
          },
        },
        lectures: true,
        availability: {
          where: {
            is_booked: false, // Only get available slots
            start_time: {
              gte: new Date(), // Only get future slots
            },
          },
        },
      },
    });

    if (!tutorProfile) {
      return res.status(404).json({ message: "Tutor not found" });
    }

    // Calculate average rating for this tutor
    const totalRating = tutorProfile.reviews.reduce(
      (acc, review) => acc + review.rating,
      0
    );
    const average_rating =
      tutorProfile.reviews.length > 0
        ? totalRating / tutorProfile.reviews.length
        : 0;

    // Format the response
    const response = {
      ...tutorProfile,
      average_rating: parseFloat(average_rating.toFixed(1)),
      reviews: tutorProfile.reviews.map((review) => ({
        ...review,
        student_name: review.student.name, // Flatten student name
      })),
    };

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching tutor profile" });
  }
});

export default tutorRoutes;
