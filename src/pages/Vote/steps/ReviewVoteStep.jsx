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

  // 1. Ha a szülő nem küld rangsort (vagy üres), akkor tudjuk, hogy nincs toplista szavazás
  const hasToplist = rankings && rankings.length > 0;
  const sortedRankings = hasToplist
    ? [...rankings].sort((a, b) => a.rank - b.rank)
    : [];

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
          {/* --- 1. Toplist Rankings - CSAK HA VAN TOPLISTA --- */}
          {hasToplist &&
            sortedRankings.map(({ performance_id, rank }, index) => {
              const perf = findPerformance(performance_id);
              return (
                <React.Fragment key={`rank-${index}`}>
                  <Box
                    onClick={() => onJumpToStep(1)} // Fixen a rangsoroló diára ugrik
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
                  />
                </React.Fragment>
              );
            })}

          {/* --- 2. Miscellaneous Categories --- */}
          {categories.map((cat, index) => {
            const performanceId = miscVotes[cat.id];
            if (!performanceId) return null;

            const perf = findPerformance(performanceId);

            // 🌟 INDEX KISZÁMÍTÁSA: Ha van toplista, akkor a 2. diától kezdődnek (2 + index).
            // Ha nincs toplista, akkor a legelső dia (0. index) a kategória, azaz simán az index!
            const targetSlidePosition = hasToplist ? 2 + index : index;

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
