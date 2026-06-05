import { useEffect, useState } from 'react';
import {
  Title,
  Subtitle,
  Avatar,
  Button,
  GridFlow,
  ProfileDisplayFlip,
} from '../../../components';
import { useProfileDisplay } from '../../../context/ProfileDisplayContext';

const VoteMiscStep = ({
  category,
  performances,
  selected,
  onSelect,
  onConfirm,
  onBack,
  userId,
}) => {
  const [currentSelection, setCurrentSelection] = useState(selected);
  const { profileDisplay } = useProfileDisplay();

  useEffect(() => {
    setCurrentSelection(selected);
  }, [selected]);

  // Read helper targeted specifically to this step's active category entry ID
  const hasUserMarkedCategory = (performerId) => {
    const saved = localStorage.getItem(`user_${userId}_marks_${performerId}`);
    if (!saved) return false;
    const parsed = JSON.parse(saved);
    return !!parsed[category.id];
  };

  const handleClick = (id) => {
    setCurrentSelection(id);
    onSelect(id);
  };

  return (
    <>
      <div className='flex flex-column flex-align-center w-100'>
        <Title text='Szavazz!' />
        <Subtitle text={category.question} />
      </div>
      <GridFlow noPadding>
        <div
          style={{ maxWidth: 'calc((100% - 30px) / 4)' }}
          className='w-100 ar-square'
        >
          <ProfileDisplayFlip />
        </div>
        {performances.map((p) => {
          const isMarkedInNotes = hasUserMarkedCategory(p.id);
          return (
            <div
              key={p.id}
              onClick={() => handleClick(p.id)}
              style={{ maxWidth: 'calc((100% - 30px) / 4)' }}
              className='w-100 ar-square pos-rel'
            >
              <Avatar
                imgSrc={p.people.avatar}
                imgName={p.people.name}
                state={
                  !currentSelection
                    ? 'default'
                    : currentSelection === p.id
                      ? 'selected'
                      : 'faded'
                }
                display={profileDisplay.icon}
                isMarked={isMarkedInNotes}
              />
            </div>
          );
        })}
      </GridFlow>

      <div className='flex flex-align-center gap-10'>
        <Button text='Vissza' onClick={onBack} />
        <Button
          text='Tovább'
          onClick={onConfirm}
          disabled={!currentSelection}
        />
      </div>
    </>
  );
};

export default VoteMiscStep;
