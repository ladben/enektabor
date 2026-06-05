import { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Button, Title, Subtitle, Box, Spinner } from '../../../components';

const RankPerformersStep = ({
  performers,
  performances,
  rankingEntries,
  hasSeenReview,
  onFastForward,
  onBack,
  onConfirm,
  onRankChange,
}) => {
  const [ranked, setRanked] = useState([]);

  useEffect(() => {
    if (performances?.length > 0 && performers?.length > 0) {
      // 1. Gather the full performance objects that match the selected IDs
      const selectedObjects = performances.filter((p) =>
        performers.includes(p.id),
      );

      // 2. Sort them cleanly based on the parent's persistent ranking entries array
      const orderedObjects = [...selectedObjects].sort((a, b) => {
        const rankA = rankingEntries.find(
          (r) => r.performance_id === a.id,
        )?.rank;
        const rankB = rankingEntries.find(
          (r) => r.performance_id === b.id,
        )?.rank;

        // If they both have saved ranks, sort by rank numbers (1, 2, 3...)
        if (rankA !== undefined && rankB !== undefined) {
          return rankA - rankB;
        }

        // Fallback: If no custom rank is found yet, preserve selection order
        return performers.indexOf(a.id) - performers.indexOf(b.id);
      });

      setRanked(orderedObjects);

      if (
        orderedObjects.length > 0 &&
        (!rankingEntries || rankingEntries.length === 0)
      ) {
        if (onRankChange) {
          onRankChange(orderedObjects);
        }
      }
    }
  }, [performers, performances, rankingEntries, onRankChange]); // Listens tightly to ranking changes on mount

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(ranked);
    const [movedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, movedItem);

    setRanked(items);

    if (onRankChange) {
      onRankChange(items);
    }
  };

  if (!ranked || ranked.length === 0 || !ranked[0]?.songs) {
    return <Spinner />;
  }

  return (
    <>
      <div className='flex flex-column flex-align-center w-100'>
        <Title text='Sorrendezz!' />
        <Subtitle text='Tartsd lenyomva és húzd a sorrendezéshez' />
      </div>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId='rankedPerformers'>
          {(droppableProvided) => (
            <div
              className='rank-list flex flex-column gap-10 ofy-auto p-16 w-100 h-100'
              {...droppableProvided.droppableProps}
              ref={droppableProvided.innerRef}
            >
              {ranked.map((p, index) => {
                const itemId = p?.id ? String(p.id) : `temp-${index}`;
                return (
                  <Draggable key={itemId} draggableId={itemId} index={index}>
                    {(draggableProvided, snapshot) => (
                      <div
                        ref={draggableProvided.innerRef}
                        {...draggableProvided.draggableProps}
                        {...draggableProvided.dragHandleProps}
                        className={`rank-box flex flex-align-center flex-fill gap-10 p-8 ${snapshot.isDragging ? 'dragging' : ''}`}
                        style={{
                          ...draggableProvided.draggableProps.style,
                          top: snapshot.isDragging
                            ? `${draggableProvided.draggableProps.style.top - 100}px`
                            : draggableProvided.draggableProps.style.top,
                          left: snapshot.isDragging
                            ? '50px'
                            : draggableProvided.draggableProps.style.left,
                        }}
                      >
                        <Box
                          className='ranked-performance'
                          state='selected'
                          artist={p?.songs?.artist || 'Ismeretlen'}
                          title={p?.songs?.title || 'Ismeretlen dal'}
                          avatar={{
                            imgSrc: p?.people?.avatar,
                            imgName: p?.people?.name,
                          }}
                          badgeText={index + 1}
                          smallImg={true}
                        />
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {droppableProvided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <div className='flex flex-align-center gap-10'>
        {!hasSeenReview && (
          <>
            <Button text='Vissza' onClick={onBack} />
            <Button text='Tovább' onClick={() => onConfirm(ranked)} />
          </>
        )}
        {hasSeenReview && (
          <>
            <Button text='Vissza' onClick={onBack} />
            <Button
              text='Áttekint'
              onClick={onFastForward}
              className='bg-acc text-color-bg' // styled with your neon accent color to look distinct
            />
          </>
        )}
      </div>
    </>
  );
};

export default RankPerformersStep;
