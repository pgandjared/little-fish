package service

import "second_hand_transaction/internal/repository"

type UserSvc struct {
	Repo *repository.UserRepo
}

func NewUserSvc(repo *repository.UserRepo) *UserSvc {
	return &UserSvc{Repo: repo}
}
func (s *UserSvc) SyncUserInf(externalID, name string) error {
	return s.Repo.SyncCasdoorInfo(externalID, name)
}
