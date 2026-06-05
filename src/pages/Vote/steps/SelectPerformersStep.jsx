import { useState, useEffect } from 'react';
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

  // Quick read helper function to check pre-saved user notes
  const hasUserMarked = (performerId) => {
    const saved = localStorage.getItem(`user_${userId}_marks_${performerId}`);
    if (!saved) return false;
    const parsed = JSON.parse(saved);
    return !!parsed['toplist']; // Looking specifically for toplist marks on this step
  };

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
          {performances.map((p) => {
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

        {miscCategories.length > 0 && (
          <div className='w-100 flex flex-column gap-16 mt-24 text-left px-16'>
            <p
              className='text-color-text text-h2'
              style={{ textAlign: 'left' }}
            >
              A következő oldalakon ezekben a kategóriákban szavazhatsz egy-egy
              előadóra:
            </p>
            <div className='flex flex-column gap-10 w-100'>
              {miscCategories.map((cat) => (
                <div
                  key={cat.id}
                  className='w-100 p-12 border-sm border-grey b-radius-10 text-color-white text-sm'
                  style={{ textAlign: 'left' }}
                >
                  ✨ <strong className='text-color-acc'>{cat.name}</strong>
                </div>
              ))}
            </div>
          </div>
        )}
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
