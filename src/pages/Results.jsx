import './Results.css';

import { useUser } from '../context/UserContext';
import { useVoteBreakdown } from '../hooks/useVoteBreakdown';
import { useActiveCompetition } from '../hooks/useActiveCompetition';
import { usePerformancesForVoting } from '../hooks/usePerformancesForVoting';
import { useRef, useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { Title, Button, Subtitle, Standing } from '../components';
import { supabase } from '../lib/supabaseClient';

const Results = () => {
  const { user } = useUser();
  const { data: competition } = useActiveCompetition();
  const competitionId = user?.competition_id;
  const { data, error, refetch } = useVoteBreakdown(competitionId);
  const { data: performances = [] } = usePerformancesForVoting(
    competitionId,
    -1,
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const swiperRef = useRef(null);

  // --- 🌟 REAL-TIME PROGRESS COUNTER STATE 🌟 ---
  const [totalVoters, setTotalVoters] = useState(0);
  const [submittedCount, setSubmittedCount] = useState(0);

  // Function to calculate exact voter registration counts dynamically
  const fetchProgressCounters = async () => {
    if (!competitionId) return;
    try {
      // 1. Count total eligible voters from your competition_participants table
      const { count: voters, error: err1 } = await supabase
        .from('competition_participants') // 🌟 Targets your actual participants matrix table
        .select('*', { count: 'exact', head: true })
        .eq('competition_id', competitionId)
        .eq('is_voter', true);

      // 2. Count rows in the 'votes' table where competition_id matches AND finalized is true
      const { count: submittals, error: err2 } = await supabase
        .from('votes')
        .select('*', { count: 'exact', head: true })
        .eq('competition_id', competitionId)
        .eq('finalized', true);

      if (!err1 && !err2) {
        setTotalVoters(voters || 0);
        setSubmittedCount(submittals || 0);
      }
    } catch (e) {
      console.error('Error updating progress counters:', e);
    }
  };

  // Realtime subscription adjustment
  useEffect(() => {
    if (!competitionId) return;

    fetchProgressCounters();

    // Listen to changes directly on your 'votes' table
    const resultsChannel = supabase
      .channel(`live_progress_tracker_${competitionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'votes', // Changed from finalized_votes to votes
          filter: `competition_id=eq.${competitionId}`,
        },
        async () => {
          await fetchProgressCounters();
          await refetch();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(resultsChannel);
    };
  }, [competitionId, refetch]);

  const goToSlide = (index) => {
    swiperRef.current?.slideTo(index);
    setActiveIndex(index);
  };

  const breakdownToRankingData = (rankings, performances, topNumber) => {
    if (!rankings || !performances || !topNumber) {
      return [];
    }
    const performerMap = new Map();

    for (let entry of rankings) {
      const { performance_id, category_value, vote_count } = entry;
      const rank = parseInt(category_value);

      if (!performerMap.has(performance_id)) {
        const perf = performances.find((p) => p.id === performance_id);
        performerMap.set(performance_id, {
          performance_id,
          imgSrc: perf?.people?.avatar || '',
          name: perf?.people?.name || '',
          score: 0,
          rankings: Array(topNumber).fill(0),
        });
      }

      const performer = performerMap.get(performance_id);
      performer.rankings[rank - 1] = vote_count;
      performer.score += (topNumber - rank + 1) * vote_count;
    }

    const rankingArray = Array.from(performerMap.values());

    rankingArray.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;

      for (let i = 0; i < topNumber; i++) {
        if (b.rankings[i] !== a.rankings[i]) {
          return b.rankings[i] - a.rankings[i];
        }
      }
      return 0;
    });

    return rankingArray;
  };

  const breakdownToMiscData = (miscEntries, performances) => {
    if (!miscEntries || !performances) {
      return [];
    }

    const groupedByCategory = {};

    for (const entry of miscEntries) {
      if (entry.category_type !== 'misc') continue;

      const category = entry.category_value;
      const perfId = entry.performance_id;
      const voteCount = entry.vote_count;

      if (!groupedByCategory[category]) {
        groupedByCategory[category] = {
          category,
          votes: [],
        };
      }

      const perf = performances.find((p) => p.id === perfId);

      if (perf) {
        groupedByCategory[category].votes.push({
          performance_id: perfId,
          imgSrc: perf.people.avatar,
          name: perf.people.name,
          score: voteCount,
        });
      }

      groupedByCategory[category].votes.sort((a, b) => b.score - a.score);
    }

    return Object.values(groupedByCategory);
  };

  // --- 🌟 DYNAMIC REAL-TIME WAITING SCREEN BRANCH 🌟 ---
  if (error?.message?.includes('Not all voters have voted yet')) {
    const progressPct =
      totalVoters > 0 ? (submittedCount / totalVoters) * 100 : 0;

    return (
      <div className='flex flex-column flex-align-center flex-justify-center gap-24 p-24 text-center h-100 w-100 max-w-400 mx-auto mt-40'>
        <Title text='Szavazatok Feldolgozása' />

        <div className='w-100 bg-surface border-sm border-grey b-radius-16 p-24 flex flex-column gap-16 mt-16 shadow-md'>
          <p className='text-color-text text-md font-medium'>
            Kérjük várj, az eredmények összegzése élőben frissül!
          </p>

          {/* Large Neon Numerical Status Indicator */}
          <div
            className='text-color-acc font-bold my-10'
            style={{ fontSize: '2.5rem', lineHeight: '1' }}
          >
            {submittedCount}{' '}
            <span className='text-color-grey text-lg font-normal'>
              / {totalVoters} lezárt
            </span>
          </div>

          {/* Smooth filling loading line bar track overlay */}
          <div
            className='w-100 bg-grey b-radius-40 ofy-hidden'
            style={{ height: '10px' }}
          >
            <div
              className='bg-acc h-100 b-radius-40'
              style={{
                width: `${progressPct}%`,
                transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            />
          </div>

          <p className='text-color-grey text-xs italic mt-8'>
            Az utolsó leadott szavazat után a táblázat automatikusan feloldódik.
          </p>
        </div>

        {/* Kept fallback button just in case user network glitches out */}
        <Button
          onClick={refetch}
          text='Kézi frissítés'
          className='opacity-40 mt-12'
        />
      </div>
    );
  }

  if (error) return <Subtitle text={`Hiba: ${error.message}`} />;

  // Parse out final variables once error clearing evaluates successfully
  const rankings = data?.filter((entry) => entry.category_type === 'rank');
  const misc = data?.filter((entry) => entry.category_type === 'misc');

  const rankingsData = breakdownToRankingData(
    rankings,
    performances,
    competition.top_number,
  );
  const miscData = breakdownToMiscData(misc, performances);

  return (
    <>
      <Swiper
        slidesPerView={1}
        spaceBetween={32}
        onSwiper={(swiper) => (swiperRef.current = swiper)}
        onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
        allowTouchMove={true}
        className='results-swiper w-100'
      >
        {/* 1st slide: Rankings table */}
        <SwiperSlide>
          <div className='w-100 h-100 ofy-hidden ofx-hidden flex flex-column gap-24'>
            <Title text='Helyezettek' />
            <div className='h-100 ofy-auto'>
              <div className='flex flex-column gap-10'>
                {rankingsData.map((standing, index) => (
                  <Standing
                    key={index}
                    avatar={{ imgSrc: standing.imgSrc, imgName: standing.name }}
                    name={standing.name}
                    score={standing.score}
                    rankings={standing.rankings}
                  />
                ))}
              </div>
            </div>
          </div>
        </SwiperSlide>

        {/* 2+ slide: misc categories */}
        {miscData.map((category, index) => (
          <SwiperSlide key={index}>
            <div className='w-100 h-100 ofy-hidden ofx-hidden flex flex-column gap-24'>
              <Title text={category.category} />
              <div className='h-100 ofy-auto'>
                <div className='flex flex-column gap-24'>
                  {category.votes.map((vote, index) => (
                    <Standing
                      key={index}
                      avatar={{ imgSrc: vote.imgSrc, imgName: vote.name }}
                      name={vote.name}
                      score={vote.score}
                    />
                  ))}
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {miscData.length > 0 && (
        <div className='result-dots flex flex-row w-100 flex-justify-center gap-16'>
          {[0, ...miscData].map((e, i) => (
            <div
              key={i}
              onClick={() => goToSlide(i)}
              className={`dot ${activeIndex === i ? 'active' : ''}`}
            />
          ))}
        </div>
      )}
    </>
  );
};

export default Results;
