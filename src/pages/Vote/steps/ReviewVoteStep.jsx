import React from "react";
import { Button, Title, Avatar, Box } from "../../../components";

const ReviewVoteStep = ({ rankings, miscVotes, performances, categories, onSubmit, onBack }) => {
  const findPerformance = (id) => performances.find((perf) => perf.id === id);
  const findCategory = (id) => categories.find((cat) => cat.id === id);

  const sortedRankings = [...rankings].sort((a, b) => a.rank - b.rank);

  return (
    <>
      <Title text="Véglegesítsd a szavazatod!" />
      <div className="ofy-auto p-16">
        <div className="flex flex-column gap-16">
          {sortedRankings.map(({performance_id, rank}, index) => {
            const perf = findPerformance(performance_id);
            return (
              <React.Fragment key={index}>
                <Box
                  state="selected"
                  artist={perf?.songs?.artist}
                  title={perf?.songs?.title}
                  avatar={{imgSrc: perf?.people?.avatar, imgName: perf?.people.name}}
                  badgeText={rank}
                  smallImg={true}
                  autoHeight={true}
                />
              </React.Fragment>
            );
          })}

          {Object.entries(miscVotes).map(([miscId, performance_id], index) => {
            const perf = findPerformance(performance_id);
            const cat = findCategory(Number(miscId));

            return (
              <React.Fragment key={index}>
                <Box
                  key={performance_id}
                  state="selected"
                  artist={perf?.songs?.artist}
                  title={perf?.songs?.title}
                  avatar={{imgSrc: perf?.people?.avatar, imgName: perf?.people.name}}
                  badgeText={cat?.name}
                  smallImg={true}
                  autoHeight={true}
                />
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div className="flex flex-align-center gap-10">
        <Button text="Vissza" onClick={onBack} />
        <Button text="Mehet" onClick={onSubmit}/>
      </div>
    </>
  );
}
 
export default ReviewVoteStep;