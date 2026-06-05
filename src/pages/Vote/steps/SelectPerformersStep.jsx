import { useState, useEffect, useMemo } from 'react';
import {
  Avatar,
  Button,
  GridFlow,
  Title,
  ProfileDisplayFlip,
} from '../../../components';
import { useProfileDisplay } from '../../../context/ProfileDisplayContext';
import { useMiscCategoriesForCompetition } from '../../../hooks/useMiscCategoriesForCompetition';

const SelectPerformersStep = ({
  performances,
  max,
  selected,
  onConfirm,
  userId,
}) => {
  const [selectedIds, setSelectedIds] = useState([]);
  const { profileDisplay } = useProfileDisplay();
  const { data: miscCategories = [] } = useMiscCategoriesForCompetition(
    performances[0]?.competition_id,
  );

  useEffect(() => {
    setSelectedIds(selected);
  }, [selected]);

  // Helper function to check notes
  const hasUserMarked = (performerId) => {
    const saved = localStorage.getItem(`user_${userId}_marks_${performerId}`);
    if (!saved) return false;
    const parsed = JSON.parse(saved);
    return !!parsed['toplist'];
  };

  // Sort the performers so marked ones bubble to the top
  const sortedPerformances = useMemo(() => {
    return [...performances].sort((a, b) => {
      const markedA = hasUserMarked(a.id) ? 1 : 0;
      const markedB = hasUserMarked(b.id) ? 1 : 0;

      if (markedB !== markedA) {
        return markedB - markedA; // Marked (1) comes before unmarked (0)
      }

      // Secondary fallback: Alphabetical sorting
      const nameA = a.people?.name || '';
      const nameB = b.people?.name || '';
      return nameA.localeCompare(nameB, 'hu');
    });
  }, [performances, userId]);

  const toggleSelection = (id) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length < max) return [...prev, id];
      return prev;
    });
  };

  const isSelected = (id) => selectedIds.includes(id);
  const canConfirm = selectedIds.length === max;

  return (
    <>
      <div className='w-100 h-100 ofy-auto flex flex-column gap-24 flex-align-center px-4 pb-112'>
        <Title text={`Szavazz az első ${max} helyezettre`} />

        <GridFlow noPadding>
          <div
            style={{ maxWidth: 'calc((100% - 30px) / 4)' }}
            className='w-100 ar-square'
          >
            <ProfileDisplayFlip />
          </div>
          {sortedPerformances.map((p) => {
            const isMarkedInNotes = hasUserMarked(p.id);
            return (
              <div
                key={p.id}
                onClick={() => toggleSelection(p.id)}
                style={{ maxWidth: 'calc((100% - 30px) / 4)' }}
                className='w-100 ar-square pos-rel'
              >
                <Avatar
                  imgSrc={p.people.avatar}
                  imgName={p.people.name}
                  state={
                    selectedIds.length === 0
                      ? 'default'
                      : isSelected(p.id)
                        ? 'selected'
                        : canConfirm
                          ? 'faded'
                          : 'default'
                  }
                  display={profileDisplay.icon}
                  isMarked={isMarkedInNotes}
                />
              </div>
            );
          })}
        </GridFlow>
      </div>

      {canConfirm && (
        <Button
          text='Sorrendezz!'
          onClick={() => onConfirm(selectedIds)}
          animation='slide-from-bottom'
          className='pos-abs b-0 m-auto l-0 r-0 mb-32'
        />
      )}
    </>
  );
};

export default SelectPerformersStep;
