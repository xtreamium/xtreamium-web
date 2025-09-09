import { useQuery } from "@tanstack/react-query";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { QueryKeys } from "../types";
import { logger } from "../lib/logger";

function StreamsPage() {
  const {
    data: streams,
    isLoading,
    error,
  } = useQuery({
    queryKey: QueryKeys.STREAMS,
    queryFn: async () => {
      // This would be your actual API call to fetch streams
      // For now, returning mock data
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return [
        {
          id: "1",
          name: "Channel 1",
          category: "Entertainment",
          url: "http://example.com/stream1",
        },
        {
          id: "2",
          name: "Channel 2",
          category: "Sports",
          url: "http://example.com/stream2",
        },
        {
          id: "3",
          name: "Channel 3",
          category: "News",
          url: "http://example.com/stream3",
        },
      ];
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">IPTV Streams</h1>
        <div>Loading streams...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">IPTV Streams</h1>
        <Card>
          <CardContent className="pt-6">
            <p>Error loading streams. Please check your connection.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">IPTV Streams</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {streams?.map((stream) => (
          <Card key={stream.id}>
            <CardHeader>
              <CardTitle>{stream.name}</CardTitle>
              <CardDescription>{stream.category}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => {
                  // Here you would call your backend API to start streaming via proxy
                  logger.info(
                    "Starting stream",
                    { url: stream.url, name: stream.name },
                    "StreamsPage"
                  );
                }}
                className="w-full"
              >
                Play Stream
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default StreamsPage;
