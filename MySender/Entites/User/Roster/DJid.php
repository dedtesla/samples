<?php

namespace MySender\Entities\User\Roster;

use MySender\Common\Structure;

class DJid extends Structure
{
    /** @var string $bare */
    private $bare;
    /** @var string $full */
    private $full;

    /**
     * @return string
     */
    public function getBare(): string
    {
        return $this->bare;
    }

    /**
     * @param string $bare
     * @return DJid
     */
    public function setBare(string $bare): DJid
    {
        $this->bare = $bare;
        return $this;
    }

    /**
     * @return string
     */
    public function getFull(): string
    {
        return $this->full;
    }

    /**
     * @param string $full
     * @return DJid
     */
    public function setFull(string $full): DJid
    {
        $this->full = $full;
        return $this;
    }


}
