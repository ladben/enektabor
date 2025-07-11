import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useUser } from "../../context/UserContext";
import { Button } from "../../components";

const SelectUserStep = ({ competition }) => {
  const [users, setUsers] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const { loginAsUser } = useUser();

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('competition_participants')
        .select('user_id, is_voter, is_jury, is_performer, people(name, avatar)')
        .eq('competition_id', competition.id);
      setUsers(data);
    };
    fetch();
  }, [competition.id]);

  const handleContinue = () => {
    const selected = users.find((u) => u.user_id === selectedId);
    loginAsUser({
      user_id: selected.user_id,
      name: selected.people.name,
      avatar: selected.people.avatar,
      roles: [{
        competition_id: competition.id,
        is_voter: selected.is_voter,
        is_jury: selected.is_jury,
        is_performer: selected.is_performer,
      }],
      competition_id: competition.id,
    });
  };

  return (
    <div className="p-4">
      <div className="grid grid-cols-2 gap-4">
        {users.map((u) => (
          <div
            key={u.user_id}
            onClick={() => setSelectedId(u.user_id)}
            className={`cursor-pointer p-2 border-rounded ${
              selectedId === u.user_id ? 'border-blue-500' : 'border-gray-300'
            }`}
          >
            <img src={u.people.avatar} alt="" className="w-full rounded-full mb.1" />
            <p className="text-center">{u.people.name}</p>
          </div>
        ))}
      </div>
      <Button onClick={handleContinue} />
    </div>
  );
};
 
export default SelectUserStep;