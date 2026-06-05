import React from 'react';
import { Button, Title, Subtitle, Box } from '../../../components';

const ReviewVoteStep = ({
  rankings,
  miscVotes,
  performances,
  categories,
  onSubmit,
  onBack,
  onJumpToStep,
}) => {
  const findPerformance = (id) => performances.find((perf) => perf.id === id);

  // Keep display items sorted beautifully from 1st place downwards
  const sortedRankings = [...rankings].sort((a, b) => a.rank - b.rank);

  return (
    <>
      <div className='flex flex-column flex-align-center w-100'>
        <Title text='Áttekintés' />
        <Subtitle
          text='(koppintással változtathatsz)'
          style={{ fontStyle: 'italic', fontSize: '14px' }}
        />
      </div>
      <div className='ofy-auto p-16 w-100 h-100'>
        <div className='flex flex-column gap-16'>
          {/* --- 1. Toplist Rankings Overview Boxes --- */}
          {sortedRankings.map(({ performance_id, rank }, index) => {
            const perf = findPerformance(performance_id);
            return (
              <React.Fragment key={`rank-${index}`}>
                <Box
                  onClick={() => onJumpToStep(1)}
                  state='selected'
                  artist={perf?.songs?.artist}
                  title={perf?.songs?.title}
                  avatar={{
                    imgSrc: perf?.people?.avatar,
                    imgName: perf?.people?.name,
                  }}
                  badgeText={`${rank}. hely`}
                  smallImg={true}
                  autoHeight={true}
                  style={{
                    cursor: 'pointer',
                    WebkitTapHighlightColor: 'transparent',
                  }}
                />
              </React.Fragment>
            );
          })}

          {/* --- 2. Miscellaneous Categories Sorted by Slider Sequence --- */}
          {categories.map((cat, index) => {
            // Find the chosen performance ID for this specific category
            const performanceId = miscVotes[cat.id];

            // If the user skipped or hasn't voted in this category yet, skip rendering it safely
            if (!performanceId) return null;

            const perf = findPerformance(performanceId);
            // Calculate the exact matching slide position (Step 0 = Selection, Step 1 = Ranking, Categories start at 2)
            const targetSlidePosition = 2 + index;

            return (
              <React.Fragment key={`misc-${cat.id}`}>
                <Box
                  onClick={() => onJumpToStep(targetSlidePosition)}
                  state='selected'
                  artist={perf?.songs?.artist}
                  title={perf?.songs?.title}
                  avatar={{
                    imgSrc: perf?.people?.avatar,
                    imgName: perf?.people?.name,
                  }}
                  badgeText={cat?.name}
                  smallImg={true}
                  autoHeight={true}
                  style={{
                    cursor: 'pointer',
                    WebkitTapHighlightColor: 'transparent',
                  }}
                />
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div className='flex flex-align-center gap-10'>
        <Button text='Mehet' onClick={onSubmit} />
      </div>
    </>
  );
};

export default ReviewVoteStep;
