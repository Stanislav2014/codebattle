import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect, useSelector } from 'react-redux';
import { useHotkeys } from 'react-hotkeys-hook';
import Gon from 'gon';
import ReactJoyride, { STATUS } from 'react-joyride';
import _ from 'lodash';
import GameWidget from './GameWidget';
import InfoWidget from './InfoWidget';
import userTypes from '../config/userTypes';
import { actions } from '../slices';
import * as GameActions from '../middlewares/Game';
import GameStatusCodes from '../config/gameStatusCodes';
import { gameStatusSelector, gamePlayersSelector, currentUserIdSelector } from '../selectors';
import WaitingOpponentInfo from '../components/WaitingOpponentInfo';
import CodebattlePlayer from './CodebattlePlayer';

const steps = [
  {
    disableBeacon: true,
    disableOverlayClose: true,
    target: '[data-guide-id="Task"]',
    title: 'Задача',
    content: 'Внимательно прочитайте задачу, обратите внимание на примеры',
    locale: {
      skip: 'Skip guide',
    },
  },
  {
    disableOverlayClose: true,
    spotlightClicks: true,
    target: '[data-guide-id="LeftEditor"] .guide-LanguagePicker',
    placement: 'top',
    title: 'Выбор языка',
    content: 'Выберите язык программирования который вам больше нравится ',
    locale: {
      skip: 'Skip guide',
    },
  },
  {
    disableOverlayClose: true,
    target: '[data-guide-id="LeftEditor"] .react-monaco-editor-container',
    title: 'Редактор',
    content: 'В редакторе вы будете вводить ваше решение, будьте внимательны к ошибкам',
    locale: {
      skip: 'Skip guide',
    },
  },
  {
    spotlightClicks: true,
    disableOverlayClose: true,
    styles: {
      options: {
        zIndex: 10000,
      },
    },
    target: '[data-guide-id="LeftEditor"] [data-guide-id="CheckResultButton"]',
    title: 'Кнопка проверки',
    content: 'Нажмите для проверки вашего решения',
    locale: {
      skip: 'Skip guide',
    },
  },
  {
    disableOverlayClose: true,
    target: '[data-guide-id="LeftEditor"] #accordionExample',
    title: 'Вывод результатов',
    content: 'Здесь вы увидите результат выполнения',
    locale: {
      skip: 'Skip guide',
    },
  },
];
const GameWidgetGuide = () => {
  const isActiveGame = useSelector(state => gameStatusSelector(state).status === GameStatusCodes.playing);
  const players = useSelector(state => gamePlayersSelector(state));
  const currentUser = useSelector(state => currentUserIdSelector(state));
  const isCurrentPlayer = _.has(players, currentUser);
  const isFirstTime = window.localStorage.getItem('guideGamePassed') === null;

  return (isFirstTime && isActiveGame && isCurrentPlayer && (
  <ReactJoyride
    continuous
    run
    scrollToFirstStep
    showProgress
    showSkipButton
    steps={steps}
    spotlightPadding={6}
    callback={({ status }) => {
      if (([STATUS.FINISHED, STATUS.SKIPPED]).includes(status)) {
        window.localStorage.setItem('guideGamePassed', 'true');
      }
}}

    styles={{
    options: {
      primaryColor: '#0275d8',
      zIndex: 1000,
    },
  }}
  />
));
};

const RootContainer = ({
  storeLoaded, gameStatusCode, checkResult, init, setCurrentUser,
}) => {
  useEffect(() => {
    const user = Gon.getAsset('current_user');
    // FIXME: maybe take from gon?
    setCurrentUser({ user: { ...user, type: userTypes.spectator } });
    init();
  }, [init, setCurrentUser]);

  useHotkeys('ctrl+enter, command+enter', e => {
    e.preventDefault();
    checkResult();
  }, [], { filter: () => true });

  if (!storeLoaded) {
    // TODO: add loader
    return null;
  }

  if (gameStatusCode === GameStatusCodes.waitingOpponent) {
    const gameUrl = window.location.href;
    return <WaitingOpponentInfo gameUrl={gameUrl} />;
  }

  const isStoredGame = gameStatusCode === GameStatusCodes.stored;

  return (
    <div className="x-outline-none">
      <GameWidgetGuide />
      <div className="container-fluid">
        <div className="row no-gutter cb-game">
          <InfoWidget />
          <GameWidget />
        </div>
      </div>
      {isStoredGame && <CodebattlePlayer />}
    </div>
  );
};

RootContainer.propTypes = {
  storeLoaded: PropTypes.bool.isRequired,
  setCurrentUser: PropTypes.func.isRequired,
  init: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  storeLoaded: state.storeLoaded,
  gameStatusCode: gameStatusSelector(state).status,
});

const mapDispatchToProps = {
  setCurrentUser: actions.setCurrentUser,
  init: GameActions.init,
  checkResult: GameActions.checkGameResult,
};

export default connect(mapStateToProps, mapDispatchToProps)(RootContainer);
