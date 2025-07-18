import './Results.css';

import { useUser } from "../context/UserContext";
import { useVoteBreakdown } from "../hooks/useVoteBreakdown";
import { useActiveCompetition } from "../hooks/useActiveCompetition";
import { usePerformancesForVoting } from "../hooks/usePerformancesForVoting";
import { useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import 'swiper/css';
import { Title, Button, Subtitle, Standing } from "../components";

const Results = () => {
  const { user } = useUser();
  const { data: competition } = useActiveCompetition();
  const competitionId = user?.competition_id;
  const { data, error, refetch } = useVoteBreakdown(competitionId);
  const { data: performances = [] } = usePerformancesForVoting(competitionId, -1);

  const [activeIndex, setActiveIndex] = useState(0);
  const swiperRef = useRef(null);

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
        const perf = performances.find(p => p.id === performance_id);
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
      if (entry.category_type !== "misc") continue;

      const category = entry.category_value;
      const perfId = entry.performance_id;
      const voteCount = entry.vote_count;

      if (!groupedByCategory[category]) {
        groupedByCategory[category] = {
          category,
          votes: [],
        };
      }

      const perf = performances.find(p => p.id === perfId);

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

  const rankingsData = breakdownToRankingData(rankings, performances, competition.top_number);
  const miscData = breakdownToMiscData(misc, performances);

  return (
    <>
      <Swiper
        slidesPerView={1}
        onSwiper={(swiper) => swiperRef.current = swiper}
        onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
        allowTouchMove={true}
        className="results-swiper w-100"
      >
        {/* 1st slide: Rankings table */}
        <SwiperSlide>
          <div className="w-100 h-100 ofy-hidden flex flex-column gap-24">
            <Title text="Helyezettek" />
            <div className="h-100 ofy-auto">
              <div className="flex flex-column gap-10">
                {rankingsData.map((standing, index) => (
                  <Standing
                    key={index}
                    avatar={{imgSrc: standing.imgSrc, imgName: standing.name}}
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
            <div className="w-100 h-100 ofy-hidden flex flex-column gap-24">
              <Title text={category.category} />
              <div className="h-100 ofy-auto">
                <div className="flex flex-column gap-24">
                  {category.votes.map((vote, index) => (
                    <Standing
                      key={index}
                      avatar={{imgSrc: vote.imgSrc, imgName: vote.name}}
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

      <div className="result-dots flex flex-row w-100 flex-justify-center gap-16">
        {[0, ...miscData].map((e, i) => (
          <div
            key={i}
            onClick={() => goToSlide(i)}
            className={`dot ${activeIndex === i ? 'active' : ''}`}
          />
        ))}
      </div>
    </>
  );
}
 
export default Results;