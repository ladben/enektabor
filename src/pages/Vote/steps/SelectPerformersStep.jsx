import { useState, useEffect } from "react";
import { Avatar, Button, GridFlow, Title, ProfileDisplayFlip } from "../../../components";
import { useProfileDisplay } from "../../../context/ProfileDisplayContext";

const SelectPerformersStep = ({ performances, max, selected, onConfirm }) => {
  const [selectedIds, setSelectedIds] = useState([]);
  const { profileDisplay } = useProfileDisplay();

  useEffect(() => {
    setSelectedIds(selected);
  }, [selected]);

  const toggleSelection = (id) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((x) => x !== id);
      } else if (prev.length < max) {
        return [...prev, id];
      }
      return prev;
    });
  };

  const isSelected = (id) => selectedIds.includes(id);
  const canConfirm = selectedIds.length === max;

  return (
    <>
      <Title text={`Szavazz az első ${max} helyezettre`} />
      <GridFlow>
        <div
          style={{maxWidth: 'calc((100% - 30px) / 4)'}}
          className="w-100 ar-square"
        >
          <ProfileDisplayFlip />
        </div>
        {performances.map((p) => (
          <div
            key={p.id}
            onClick={() => toggleSelection(p.id)}
            style={{maxWidth: 'calc((100% - 30px) / 4)'}}
            className="w-100 ar-square"
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
            />
          </div>
        ))}
      </GridFlow>
      {canConfirm && (
        <Button
          text="Sorrendezz!"
          onClick={() => onConfirm(selectedIds)}
          className="pos-abs b-0"
          animation="slide-from-bottom"
        />
      )}
    </>
  );
}
 
export default SelectPerformersStep;