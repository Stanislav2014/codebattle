import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import _ from 'lodash';
import ReactMarkdown from 'react-markdown';
import i18n from '../../i18n';
import { usersSelector, currentUserIdSelector } from '../redux/UserRedux';
import GameStatuses from '../config/gameStatuses';
import {
  gameStatusSelector,
  gameStatusTitleSelector,
  gameTaskSelector,
} from '../redux/GameRedux';
import { checkGameResult } from '../middlewares/Game';
import userTypes from '../config/userTypes';

class GameStatusTab extends Component {
  static propTypes = {
    users: PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
      raiting: PropTypes.number,
    }),
    status: PropTypes.string,
    title: PropTypes.string,
  }

  static defaultProps = {
    status: GameStatuses.initial,
    title: '',
    users: {},
  }

  render() {
    const {
      users,
      gameStatus,
      title,
      checkResult,
      currentUserId,
      task
    } = this.props;
    const userType = _.get(users[currentUserId], 'type', null);
    const allowedGameStatuses = [GameStatuses.playing, GameStatuses.playerWon];
    const canCheckResult = _.includes(allowedGameStatuses, gameStatus.status) &&
      userType &&
      (userType !== userTypes.spectator);

    return (
      <div className="card mt-4 h-100 border-0">
        <h2>{title}</h2>
        <p>Players</p>
        {_.isEmpty(users) ? null : (
          <ul>
            {_.map(_.values(users), user => (
              <li key={user.id}>{`${user.name}(${user.raiting})`}</li>
            ))}
          </ul>
        )}
        {_.isEmpty(task) ? null : (
          <div className="card mb-3">
            <div className="card-body">
              <h4 className="card-title">{task.name}</h4>
              <h6 className="card-subtitle text-muted">
                {`${i18n.t('Level')}: ${task.level}`}
              </h6>
              <ReactMarkdown
                className="card-text"
                source={task.description}
              />
            </div>
          </div>
        )}
        <div className="row">
          <div className="col">
            {!canCheckResult ? null : (
              <div>
                <button
                  className="btn btn-success"
                  onClick={checkResult}
                  disabled={gameStatus.checking}
                >
                  {gameStatus.checking ? i18n.t('Checking...') : i18n.t('Check result')}
                </button>
              </div>
            )}
          </div>
          <div className="col text-right">
            <h3>
              <span className="p-3 badge badge-danger">
                {gameStatus.status}
              </span>
            </h3>
          </div>
        </div>
        <div className="row">
          {gameStatus.solutionStatus === false ? (
            <div className="alert alert-danger alert-dismissible fade show">
              {i18n.t('Checking failed')}
            </div>
          ) : null}
          {gameStatus.solutionStatus === true ? (
            <div className="alert alert-success alert-dismissible fade show">
              <span aria-hidden="true">{'&times;'}</span>
              {i18n.t('All test are passed!!11')}
            </div>
          ) : null}
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  users: usersSelector(state),
  currentUserId: currentUserIdSelector(state),
  gameStatus: gameStatusSelector(state),
  title: gameStatusTitleSelector(state),
  task: gameTaskSelector(state),
});

const mapDispatchToProps = dispatch => ({
  checkResult: () => dispatch(checkGameResult()),
});

export default connect(mapStateToProps, mapDispatchToProps)(GameStatusTab);