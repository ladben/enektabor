import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { useProfileDisplay } from '../../context/ProfileDisplayContext';
import { usePerformancesForVoting } from '../../hooks/usePerformancesForVoting';
import { useMiscCategoriesForCompetition } from '../../hooks/useMiscCategoriesForCompetition';
import {
  Title,
  GridFlow,
  Avatar,
  ProfileDisplayFlip,
  Spinner,
} from '../../components';
import PerformerDetailDrawer from './PerformerDetailDrawer';

const WaitRoom = () => {
  const { user } = useUser();
  const { profileDisplay } = useProfileDisplay();
  const navigate = useNavigate();
  const [selectedPerformer, setSelectedPerformer] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  const { data: performances = [], isLoading: perfLoading } =
    usePerformancesForVoting(user?.competition_id, user?.user_id);
  const { data: categories = [] } = useMiscCategoriesForCompetition(
    user?.competition_id,
  );

  if (!user || perfLoading || !profileDisplay) {
    // Safeguard profile state loading
    return <Spinner />;
  }

  return (
    <div className='flex flex-column gap-24 flex-align-center w-100 h-100 ofy-hidden'>
      <Title text='Váróterem' />
      <GridFlow>
        <div
          style={{ maxWidth: 'calc((100% - 30px) / 4)' }}
          className='w-100 ar-square'
        >
          <ProfileDisplayFlip />
        </div>
        {performances.map((p) => (
          <div
            key={p.id}
            className='w-100 ar-square'
            style={{ maxWidth: 'calc((100% - 30px) / 4)' }}
            onClick={() => p.selected && setSelectedPerformer(p)}
          >
            <Avatar
              imgSrc={p.people.avatar}
              imgName={p.people.name}
              state={p.selected ? 'default' : 'faded'}
              display={profileDisplay.icon}
            />
          </div>
        ))}
      </GridFlow>

      <PerformerDetailDrawer
        performer={selectedPerformer}
        categories={categories}
        onClose={() => setSelectedPerformer(null)}
      />
    </div>
  );
};

export default WaitRoom;
