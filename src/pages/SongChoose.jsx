import React from 'react';
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { usePerformancesForPerformer } from "../hooks/usePerformancesForPerformer";
import { Title, Button, Box } from "../components";
import { supabase } from "../lib/supabaseClient";

import { motion } from 'framer-motion';
// eslint disable-next-line no-unused-expressions
void motion;
import { listVariants, boxVariants } from '../animations/variants';

const SongChoose = () => {
  const { user } = useUser();
  const { data: performances = [] } = usePerformancesForPerformer(user?.user_id, user?.competition_id);
  const [selectedPerformanceId, setSelectedPerformanceId] = useState(null);
  const [animateNow, setAnimateNow] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (performances && selectedPerformanceId === null) {
      const preselected = performances.find(p => p.selected);
      if (preselected) setSelectedPerformanceId(preselected.id);
    }
  },[performances, selectedPerformanceId, setSelectedPerformanceId]);

  useEffect(() => {
    const timeout = setTimeout(() => setAnimateNow(true), 500);
    return () => clearTimeout(timeout);
  },[]);

  if (!user) return null;

  const handleContinue = async () => {
    const { error } = await supabase
      .from('performances')
      .update({ selected: true })
      .eq('id', selectedPerformanceId);
    if (error) {
      console.error('Failed to update selection', error.message);
      return;
    }

    navigate('/vote');
  };

  return (
    <div
      className={`
        flex flex-column gap-24 flex-align-center
        pb-112
        h-100
        pos-rel
      `}
    >
      <Title text="Melyik dalt választottad?" />
      <motion.div
        className='w-100 flex flex-column gap-32 h-100'
        variants={listVariants}
        initial="initial"
        animate={animateNow ? 'animate' : 'initial'}
      >
        {performances.map(perf => (
          <motion.div
            key={perf.id}
            variants={boxVariants}
            className='flex-fill'
          >
            <Box
              onClick={() => setSelectedPerformanceId(perf.id)}
              artist={perf.songs.artist}
              title={perf.songs.title}
              state={!selectedPerformanceId ? 'default' : selectedPerformanceId === perf.id ? 'selected' : 'faded'}
            />
          </motion.div>
        ))}
      </motion.div>
      {selectedPerformanceId && (
        <Button
          text="Folytatás"
          iconType='tick'
          onClick={handleContinue}
          className="pos-abs b-0"
          animation='slide-from-bottom'
        />
      )}
    </div>
  );
};
 
export default SongChoose;