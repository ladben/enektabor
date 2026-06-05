import React from 'react';
import { Button, Title, Box } from '../../../components';

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
  const findCategory = (id) => categories.find((cat) => cat.id === id);

  // Keep display items sorted beautifully from 1st place downwards
  const sortedRankings = [...rankings].sort((a, b) => a.rank - b.rank);

  return (
    <>
      <Title text='Véglegesítsd a szavazatod!' />
      <div className='ofy-auto p-16 w-100 h-100 pb-112'>
        <div className='flex flex-column gap-16'>
          {/* --- 1. Toplist Rankings Overview Boxes --- */}
          {sortedRankings.map(({ performance_id, rank }, index) => {
            const perf = findPerformance(performance_id);
            return (
              <React.Fragment key={`rank-${index}`}>
                <Box
                  // Tapping any rank item slides the user straight to the sorting page (Index 1)
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

          {/* --- 2. Miscellaneous Categories Overview Boxes --- */}
          {Object.entries(miscVotes).map(([miscId, performance_id], index) => {
            const perf = findPerformance(performance_id);
            const cat = findCategory(Number(miscId));

            // Calculate the exact sliding position match for this category item step page.
            // Step 0 = Selection, Step 1 = Sorting, so your dynamic categories begin at Index 2!
            const categoryIndexInSequence = categories.findIndex(
              (c) => c.id === Number(miscId),
            );
            const targetSlidePosition = 2 + categoryIndexInSequence;

            return (
              <React.Fragment key={`misc-${index}`}>
                <Box
                  // Tapping a category item slides the user directly to its specific voting page
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
        <Button text='Vissza' onClick={onBack} />
        <Button text='Mehet' onClick={onSubmit} />
      </div>
    </>
  );
};

export default ReviewVoteStep;
