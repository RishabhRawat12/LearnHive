import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";

interface Review {
  id: number;
  learnerName: string;
  learnerAvatar?: string;
  rating: number;
  comment: string;
  date: string;
}

interface ReviewsListProps {
  reviews: Review[];
}

const ReviewsList = ({ reviews }: ReviewsListProps) => {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  if (reviews.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">No reviews yet</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <Card key={review.id} className="p-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={review.learnerAvatar} alt={review.learnerName} />
              <AvatarFallback className="bg-accent text-primary">
                {getInitials(review.learnerName)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <h4 className="font-semibold">{review.learnerName}</h4>
                  <p className="text-xs text-muted-foreground">
                    {new Date(review.date).toLocaleDateString("en-IN", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < review.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {review.comment}
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default ReviewsList;
