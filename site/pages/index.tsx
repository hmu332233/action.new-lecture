import { useEffect, useState, useRef } from 'react';

import dayjs from 'dayjs';
import Card from '../components/Card';
import Table from '../components/Table';
import Tabs from '../components/Tabs';
import Layout from '../components/Layout';
import DateButtonGroup from '../components/DateButtonGroup';
import ServiceSelect from '../components/ServiceSelect';

const todayString = dayjs().format('YYYY-MM-DD');

function Home() {
  const [activeTabId, setActiveTabId] = useState('popular');
  const [service, setService] = useState('inflearn');
  const [date, setDate] = useState(todayString);
  const prevOrderMap = useRef<{ [key: string]: number }>({});
  const [lectures, setLectures] = useState<Lecture[]>([]);
  useEffect(() => {
    (async () => {
      const res = await fetch(
        `/api/lectures/${service}/${date}/${activeTabId}`,
      );

      const isSuccess = res.status === 200;
      const data = isSuccess ? await res.json() : [];

      setLectures((prevLectures) => {
        prevOrderMap.current = prevLectures.reduce(
          (prev, lecture, index) => ({ ...prev, [lecture.id]: index }),
          {},
        );
        return data;
      });
    })();
  }, [service, date, activeTabId]);

  const handlePrev = () => {
    const prevDate = dayjs(date).add(-1, 'day').format('YYYY-MM-DD');
    setDate(prevDate);
  };

  const handleNext = () => {
    const prevDate = dayjs(date).add(1, 'day').format('YYYY-MM-DD');
    setDate(prevDate);
  };

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const {
      currentTarget: { value },
    } = e;
    setService(value);
  };

  const handleTabItemClick = (id: string) => {
    setActiveTabId(id);
  };

  return (
    <Layout>
      <div className="flex flex-col justify-center items-center px-6">
        <h1 className="text-3xl font-bold text-center mb-4">
          Lecture Ranking!
        </h1>
        <ServiceSelect value={service} onChange={handleSelect} />
        <DateButtonGroup
          date={date}
          onPrevClick={handlePrev}
          onNextClick={handleNext}
        />
      </div>
      <Tabs activeId={activeTabId} onItemClick={handleTabItemClick} />
      <div className="bg-base-100 p-6 h-100 max-h-screen overflow-y-auto">
        {lectures.map((lecture, index) => (
          <Card
            key={`${lecture.id}-${index}`} // NOTE: key에 index를 포함해서 order가 달라지면 리랜더링으로 애니메이션이 동작하도록 함
            lecture={lecture}
            prevOrder={prevOrderMap.current[lecture.id]}
            order={index}
          />
        ))}
        {/* <Table lectures={lectures} prevOrderMap={prevOrderMap.current} /> */}
      </div>
    </Layout>
  );
}

export default Home;
