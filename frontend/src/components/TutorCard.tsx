import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

interface TutorCardProps {
  tutor: {
    id: number;
    name: string;
    bio: string;
    hourly_rate: number;
    average_rating: number;
    avatar?: string;
    subjects: string[];
  };
}

const TutorCard = ({ tutor }: TutorCardProps) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <Card className="p-6 transition-all hover:shadow-lg">
      <div className="flex items-start gap-6">
        <Avatar className="h-20 w-20">
          <AvatarImage src={tutor.avatar} alt={tutor.name} />
          <AvatarFallback className="bg-accent text-lg font-semibold text-primary">
            {getInitials(tutor.name)}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 space-y-2">
          <div>
            <h3 className="text-xl font-bold text-foreground">{tutor.name}</h3>
            <div className="flex flex-wrap gap-2 mt-1">
              {tutor.subjects.map((subject) => (
                <span key={subject} className="px-2 py-1 bg-accent text-accent-foreground text-xs rounded-full">
                  {subject}
                </span>
              ))}
            </div>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">{tutor.bio}</p>
          <div className="flex items-center gap-1 text-sm">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold">{tutor.average_rating.toFixed(1)}</span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-3">
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">₹{tutor.hourly_rate}</div>
            <div className="text-xs text-muted-foreground">per hour</div>
          </div>
          <Link to={`/tutor/${tutor.id}`}>
            <Button variant="default">View Profile</Button>
          </Link>
        </div>
      </div>
    </Card>
  );
};

export default TutorCard;
