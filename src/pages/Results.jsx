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

  // Kivesszük a verseny konfigurációs változóit a skálázáshoz
  const topNumber = competition?.top_number || 0;
  const isAdvanced = competition?.is_advanced_score_calculation || false;

  // 🌟 MÓDOSÍTVA: Átadjuk az isAdvanced flag-et és a topNumber súlyozási értéket is a hooknak
  const { data, error, refetch } = useVoteBreakdown(
    competitionId,
    isAdvanced,
    topNumber,
  );

  const { data: performances = [] } = usePerformancesForVoting(
    competitionId,
    -1,
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const swiperRef = useRef(null);

  // --- Real-time Progress Counter State ---
  const [totalVoters, setTotalVoters] = useState(0);
  const [submittedCount, setSubmittedCount] = useState(0);

  // Function to calculate exact voter registration counts dynamically
  const fetchProgressCounters = async () => {
    if (!competitionId) return;
    try {
      // 1. Count total eligible voters from competition_participants table
      const { count: voters, error: err1 } = await supabase
        .from('competition_participants')
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

    // Listen to changes directly on 'votes' table
    const resultsChannel = supabase
      .channel(`live_progress_tracker_${competitionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'votes',
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

    const teamSizes = {};
    performances.forEach((p) => {
      if (p.group_id) {
        teamSizes[p.group_id] = (teamSizes[p.group_id] || 0) + 1;
      }
    });

    const performerMap = new Map();

    for (let entry of rankings) {
      const { performance_id, category_value, vote_count } = entry;
      const rank = parseInt(category_value);
      const parsedVoteCount = parseFloat(vote_count);

      const rankWeight = topNumber - rank + 1;

      if (!performerMap.has(performance_id)) {
        const perf = performances.find((p) => p.id === performance_id);
        performerMap.set(performance_id, {
          performance_id,
          imgSrc: perf?.people?.avatar || '',
          name: perf?.people?.name || '',
          score: 0,
          rankings: Array(topNumber).fill(0),
          rawPerf: perf,
        });
      }

      const performer = performerMap.get(performance_id);

      if (isAdvanced) {
        performer.score += parsedVoteCount;

        const groupId = performer.rawPerf?.group_id;
        const teamSize = groupId ? teamSizes[groupId] || 1 : 1;
        const eligibleCount = totalVoters - teamSize;

        if (eligibleCount > 0 && rankWeight > 0) {
          performer.rankings[rank - 1] = Math.round(
            (parsedVoteCount * eligibleCount) / rankWeight,
          );
        } else {
          performer.rankings[rank - 1] = 0;
        }
      } else {
        performer.score += rankWeight * parsedVoteCount;
        performer.rankings[rank - 1] = parsedVoteCount;
      }
    }

    let rankingArray = Array.from(performerMap.values());

    // 🌟 MÓDOSÍTVA: Skálázás a valós elméleti maximumra 🌟
    if (isAdvanced && rankingArray.length > 0) {
      const maxScore = Math.max(...rankingArray.map((p) => p.score));

      // Kiszámoljuk a hagyományos világ elméleti maximumát: (Összes szavazó - 1) * top_number
      const maxPossibleScore = (totalVoters - 1) * topNumber;

      if (maxScore > 0 && maxPossibleScore > 0) {
        rankingArray = rankingArray.map((performer) => ({
          ...performer,
          // (Saját advanced pont / Legmagasabb advanced pont) * Elméleti max pontszám
          score: Math.round((performer.score / maxScore) * maxPossibleScore),
        }));
      }
    }

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
      const voteCount = parseFloat(entry.vote_count);

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
    }

    const processedCategories = Object.values(groupedByCategory);

    // 🌟 MÓDOSÍTVA: Különdíjak skálázása a valós elméleti maximumra 🌟
    if (isAdvanced) {
      processedCategories.forEach((cat) => {
        if (cat.votes.length > 0) {
          const maxMiscScore = Math.max(...cat.votes.map((v) => v.score));

          // Különdíjnál a megszerezhető max pontszám egy szólónak: Összes szavazó - 1
          const maxPossibleMiscScore = totalVoters - 1;

          if (maxMiscScore > 0 && maxPossibleMiscScore > 0) {
            cat.votes = cat.votes.map((vote) => ({
              ...vote,
              score: Math.round(
                (vote.score / maxMiscScore) * maxPossibleMiscScore,
              ),
            }));
          }
        }
      });
    }

    processedCategories.forEach((cat) => {
      cat.votes.sort((a, b) => b.score - a.score);
    });

    return processedCategories;
  };

  // --- DYNAMIC REAL-TIME WAITING SCREEN BRANCH ---
  if (error?.message?.includes('Not all voters have voted yet')) {
    const progressPct =
      totalVoters > 0 ? (submittedCount / totalVoters) * 100 : 0;

    return (
      <>
        <div className='flex flex-column flex-align-center w-100'>
          <Title text='Szavazatok Feldolgozása' />
          <Subtitle text='Az utolsó leadott szavazat után a táblázat automatikusan feloldódik' />
        </div>

        <div className='w-100 p-20 b-radius-10 flex flex-column gap-16 elevation-md-blue'>
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
        </div>
      </>
    );
  }

  if (error) return <Subtitle text={`Hiba: ${error.message}`} />;

  // Parse out final variables once error clearing evaluates successfully
  const rankings = data?.filter((entry) => entry.category_type === 'rank');
  const misc = data?.filter((entry) => entry.category_type === 'misc');

  const rankingsData = breakdownToRankingData(
    rankings,
    performances,
    competition?.top_number,
  );
  const miscData = breakdownToMiscData(misc, performances);

  // Check if a toplista calculation is active for this gala
  const hasToplist = competition?.top_number > 0;

  // 🌟 DYNAMIC FORMATTER: Ha a végeredmény kerek egész pont (pl. 12), tisztán írja ki.
  // Ha Advanced módban tört pontszám keletkezik (pl. 14.333), szépen kerekíti 2 tizedesjegyre (14.33).
  const formatScoreDisplay = (scoreValue) => {
    if (scoreValue % 1 === 0) return scoreValue;
    return scoreValue.toFixed(2);
  };

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
        {/* 1st slide: Rankings table - ONLY IF TOPLIST IS ENABLED */}
        {hasToplist && (
          <SwiperSlide>
            <div className='w-100 h-100 ofy-hidden ofx-hidden flex flex-column gap-24'>
              <Title text='Helyezettek' />
              <div className='h-100 ofy-auto'>
                <div className='flex flex-column gap-10'>
                  {rankingsData.map((standing, index) => (
                    <Standing
                      key={index}
                      avatar={{
                        imgSrc: standing.imgSrc,
                        imgName: standing.name,
                      }}
                      name={standing.name}
                      // 🌟 MÓDOSÍTVA: Alkalmazzuk a kerekítést a kijelzésnél
                      score={formatScoreDisplay(standing.score)}
                      rankings={standing.rankings}
                    />
                  ))}
                </div>
              </div>
            </div>
          </SwiperSlide>
        )}

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
                      // 🌟 MÓDOSÍTVA: Alkalmazzuk a kerekítést a különdíjaknál is
                      score={formatScoreDisplay(vote.score)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Adjust visual paging indicator markers matching layout sizes */}
      {miscData.length > 0 && (
        <div className='result-dots flex flex-row w-100 flex-justify-center gap-16'>
          {(hasToplist ? [0, ...miscData] : miscData).map((e, i) => (
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
