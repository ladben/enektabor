import { useRef, useImperativeHandle, forwardRef } from "react";
import { SequenceContext } from "../../context/SequenceContext";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

const Sequence = forwardRef(({ children, speed = 500, onSlideChange, BUTTON_PRESSED_TIME = 150, SWIPE_DELAY = 50 }, ref) => {
  const swiperRef = useRef(null);
  
  // Expose swiper methods to parent
  useImperativeHandle(ref, () => ({
    slideNext: (duration = speed) => swiperRef.current?.slideNext(duration),
    slidePrev: (duration = speed) => swiperRef.current?.slidePrev(duration),
    slideTo: (index, duration = speed) => swiperRef.current?.slideTo(index, duration),
    getIndex: () => swiperRef.current?.activeIndex,
  }));

  const flatChildren = children.flat();

  return (
    <SequenceContext.Provider value={{ BUTTON_PRESSED_TIME, SWIPE_DELAY}}>
      <Swiper
        speed={speed}
        allowTouchMove={false}
        slidesPerView={1}
        onSwiper={(swiper) => (swiperRef.current = swiper)}
        onSlideChange={onSlideChange}
        className="w-100"
      >
        {Array.isArray(flatChildren)
          ? flatChildren.map((child, idx) => <SwiperSlide key={idx}>{child}</SwiperSlide>)
          : <SwiperSlide>{children}</SwiperSlide>
        }
      </Swiper>
    </SequenceContext.Provider>
  );
});
 
export default Sequence;