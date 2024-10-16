import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons';
import classNames from 'classnames';
import { Link } from 'react-router-dom';
import { Card, Dropdown, ListGroup } from 'react-bootstrap';
import { isIterableArray } from '../../../helpers/utils';
import useFakeFetch from '../../../hooks/useFakeFetch';
import FalconCardHeader from '../../../components/common/FalconCardHeader';
import Notification from '../../../components/notification/Notification';

const NotificationDropdown = () => {
  // State
  const { data: newNotifications, setData: setNewNotifications } =
    useFakeFetch([]);
  const { data: earlierNotifications, setData: setEarlierNotifications } =
    useFakeFetch([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isAllRead, setIsAllRead] = useState(false);

  // Handler
  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    window.addEventListener('scroll', () => {
      window.innerWidth < 1200 && setIsOpen(false);
    });
  }, []);

  const markAsRead = e => {
    e.preventDefault();

    const updatedNewNotifications = newNotifications.map(notification =>
      Object.prototype.hasOwnProperty.call(notification, 'unread')
        ? { ...notification, unread: false }
        : notification
    );
    const updatedEarlierNotifications = earlierNotifications.map(notification =>
      Object.prototype.hasOwnProperty.call(notification, 'unread')
        ? { ...notification, unread: false }
        : notification
    );

    setIsAllRead(true);
    setNewNotifications(updatedNewNotifications);
    setEarlierNotifications(updatedEarlierNotifications);
  };

  return (
    <Dropdown navbar={true} as="li" show={isOpen} onToggle={handleToggle}>
      <Dropdown.Toggle
        bsPrefix="toggle"
        as={Link}
        className={classNames('px-0 nav-link nav-not-hover', {
          'notification-indicator notification-indicator-primary': !isAllRead
        })}
      >
        <FontAwesomeIcon icon={faBell} transform="shrink-6" className="fs-3" />
      </Dropdown.Toggle>

      <Dropdown.Menu className="dropdown-menu-card dropdown-menu-end dropdown-caret dropdown-caret-bg">
        <Card
          className="dropdown-menu-notification dropdown-menu-end shadow-none"
          style={{ maxWidth: '6rem' }}
        >
          <FalconCardHeader
            className="card-header"
            title="Notifications"
            titleTag="h6"
            light={false}
            style={{maxWidth: '6rem'}}
          />
          <ListGroup
            variant="flush"
            className="fw-normal fs--1 scrollbar"
            style={{ maxHeight: '19rem' }}
          >
            <div className="list-group-title">NEW</div>{' '}
            {isIterableArray(newNotifications) &&
              newNotifications.map(notification => (
                <ListGroup.Item key={notification.id} onClick={handleToggle}>
                  <Notification {...notification} flush />
                </ListGroup.Item>
              ))}
            <div className="list-group-title">EARLIER</div>
            {isIterableArray(earlierNotifications) &&
              earlierNotifications.map(notification => (
                <ListGroup.Item key={notification.id} onClick={handleToggle}>
                  <Notification {...notification} flush />
                </ListGroup.Item>
              ))}
          </ListGroup>
          <div
            className="card-footer text-center border-top"
            onClick={handleToggle}
          >
            <Link className="card-link d-block" to="/notifications">
              View all
            </Link>
          </div>
        </Card>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default NotificationDropdown;
