import { useUser } from "../context/UserContext";
import { useVoteBreakdown } from "../hooks/useVoteBreakdown";
import { Title, Button, Subtitle } from "../components";

const Results = () => {
  const { user } = useUser();
  const competitionId = user?.competition_id;
  const { data, error, refetch } = useVoteBreakdown(competitionId);

  // parse the flat list into categories
  const rankings = data?.filter((entry) => entry.category_type === "rank");
  const misc = data?.filter((entry) => entry.category_type === "misc");

  if (error?.message?.includes('Not all voters have voted yet')) {
    return (
      <div className="flex flex-column flex-align-center gap-16">
        <Subtitle text="Még nem szavazott mindenki." />
        <Button onClick={refetch} text="Újratöltés"/>
      </div>
    );
  }

  if (error) return <Subtitle text={`Hiba: ${error.message}`} />

  console.log('rankings: ', rankings);
  console.log('misc: ', misc);

  return (
    <div>Results</div>
  );
}
 
export default Results;